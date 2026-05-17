terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }

  backend "s3" {
    bucket         = "ecommerce-tf-state-staging"
    key            = "staging/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "ecommerce-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags { tags = local.common_tags }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags { tags = local.common_tags }
}

locals {
  env         = "staging"
  name_prefix = "ecommerce-${local.env}"
  common_tags = {
    Environment = local.env
    Project     = "ecommerce"
    ManagedBy   = "terraform"
  }
}

module "vpc" {
  source             = "../../modules/vpc"
  name_prefix        = local.name_prefix
  vpc_cidr           = "10.1.0.0/16"
  availability_zones = ["${var.aws_region}a", "${var.aws_region}b"]
  single_nat_gateway = true  # single NAT saves ~$33/month for staging
  tags               = local.common_tags
}

module "ecr" {
  source          = "../../modules/ecr"
  repository_name = "ecommerce-backend"  # shares repo with prod; different tags
  max_image_count = 5
  tags            = local.common_tags
}

module "waf_cloudfront" {
  source      = "../../modules/waf"
  name_prefix = "${local.name_prefix}-cf"
  scope       = "CLOUDFRONT"
  tags        = local.common_tags
  providers   = { aws = aws.us_east_1 }
}

module "waf_alb" {
  source      = "../../modules/waf"
  name_prefix = "${local.name_prefix}-alb"
  scope       = "REGIONAL"
  tags        = local.common_tags
}

module "frontend" {
  source              = "../../modules/cloudfront-frontend"
  name_prefix         = local.name_prefix
  bucket_name         = "${local.name_prefix}-frontend"
  domain_aliases      = [var.frontend_domain]
  acm_certificate_arn = var.acm_certificate_arn_us_east_1
  waf_web_acl_arn     = module.waf_cloudfront.web_acl_arn
  price_class         = "PriceClass_100"
  tags                = local.common_tags
  providers           = { aws = aws.us_east_1 }
}

module "iam" {
  source                     = "../../modules/iam"
  name_prefix                = local.name_prefix
  environment                = local.env
  github_repo                = var.github_repo
  secrets_manager_arn        = module.secrets.secret_arn
  ecr_repository_arn         = module.ecr.repository_arn
  frontend_bucket_name       = module.frontend.s3_bucket_name
  cloudfront_distribution_id = module.frontend.cloudfront_distribution_id
  enable_ecs_exec            = true  # allow debugging in staging
  create_oidc_provider       = false # OIDC provider already created by production env
  existing_oidc_provider_arn = var.oidc_provider_arn
  tags                       = local.common_tags
}

module "secrets" {
  source                 = "../../modules/secrets"
  secret_path            = "ecommerce/staging"
  environment            = local.env
  ecs_execution_role_arn = module.iam.ecs_execution_role_arn
  recovery_window_days   = 7
  tags                   = local.common_tags
  depends_on             = [module.iam]
}

module "route53" {
  source                    = "../../modules/route53"
  route53_zone_id           = var.route53_zone_id
  frontend_domain           = var.frontend_domain
  api_domain                = var.api_domain
  cloudfront_domain_name    = module.frontend.cloudfront_domain_name
  cloudfront_hosted_zone_id = module.frontend.cloudfront_hosted_zone_id
  alb_dns_name              = module.alb.alb_dns_name
  alb_zone_id               = module.alb.alb_zone_id
  tags                      = local.common_tags
}

module "alb" {
  source                     = "../../modules/alb"
  name_prefix                = local.name_prefix
  vpc_id                     = module.vpc.vpc_id
  public_subnet_ids          = module.vpc.public_subnet_ids
  alb_security_group_id      = module.vpc.alb_security_group_id
  acm_certificate_arn        = module.route53.api_certificate_arn
  enable_deletion_protection = false
  tags                       = local.common_tags
  depends_on                 = [module.route53]
}

resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = module.alb.alb_arn
  web_acl_arn  = module.waf_alb.web_acl_arn
}

module "ecs" {
  source                = "../../modules/ecs"
  name_prefix           = local.name_prefix
  aws_region            = var.aws_region
  container_image       = "${module.ecr.repository_url}:latest"
  task_cpu              = 256   # smaller tasks for staging (cheaper)
  task_memory           = 512
  desired_count         = 1
  min_tasks             = 1
  max_tasks             = 3
  execution_role_arn    = module.iam.ecs_execution_role_arn
  task_role_arn         = module.iam.ecs_task_role_arn
  target_group_arn      = module.alb.target_group_arn
  private_subnet_ids    = module.vpc.private_subnet_ids
  ecs_security_group_id = module.vpc.ecs_security_group_id
  secrets_manager_arn   = module.secrets.secret_arn
  use_spot              = true  # Fargate Spot: 70-90% discount for staging
  enable_execute_command = true
  log_retention_days    = 90
  tags                  = local.common_tags
  depends_on            = [module.alb, module.secrets, module.iam]
}

module "monitoring" {
  source                     = "../../modules/monitoring"
  name_prefix                = local.name_prefix
  ecs_cluster_name           = module.ecs.cluster_name
  ecs_service_name           = module.ecs.service_name
  alb_arn_suffix             = module.alb.alb_arn
  target_group_arn_suffix    = module.alb.target_group_arn
  cloudfront_distribution_id = module.frontend.cloudfront_distribution_id
  alert_emails               = var.alert_emails
  tags                       = local.common_tags
}
