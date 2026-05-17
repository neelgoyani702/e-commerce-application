terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
    # Separate provider alias for us-east-1 (CloudFront + WAF CLOUDFRONT scope)
    # require ACM certs and WAF WebACLs to be in us-east-1
  }

  backend "s3" {
    bucket         = "ecommerce-tf-state-prod"   # created by bootstrap.sh
    key            = "production/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "ecommerce-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags { tags = local.common_tags }
}

# CloudFront and CLOUDFRONT-scoped WAF must live in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags { tags = local.common_tags }
}

locals {
  env         = "production"
  name_prefix = "ecommerce-${local.env}"
  common_tags = {
    Environment = local.env
    Project     = "ecommerce"
    ManagedBy   = "terraform"
  }
}

# ── VPC ──────────────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  name_prefix        = local.name_prefix
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["${var.aws_region}a", "${var.aws_region}b"]
  app_port           = 4000
  single_nat_gateway = false # Two NAT GWs for HA in production
  tags               = local.common_tags
}

# ── ECR ──────────────────────────────────────────────────────
module "ecr" {
  source          = "../../modules/ecr"
  repository_name = "ecommerce-backend"
  max_image_count = 10
  tags            = local.common_tags
}

# ── WAF (CloudFront scope — must be in us-east-1) ────────────
module "waf_cloudfront" {
  source      = "../../modules/waf"
  name_prefix = "${local.name_prefix}-cf"
  scope       = "CLOUDFRONT"
  tags        = local.common_tags

  providers = { aws = aws.us_east_1 }
}

# ── WAF (Regional — attached to ALB) ─────────────────────────
module "waf_alb" {
  source      = "../../modules/waf"
  name_prefix = "${local.name_prefix}-alb"
  scope       = "REGIONAL"
  tags        = local.common_tags
}

# ── Frontend: S3 + CloudFront ─────────────────────────────────
module "frontend" {
  source = "../../modules/cloudfront-frontend"

  name_prefix         = local.name_prefix
  bucket_name         = "${local.name_prefix}-frontend"
  domain_aliases      = [var.frontend_domain]
  acm_certificate_arn = var.acm_certificate_arn_us_east_1  # must be in us-east-1
  waf_web_acl_arn     = module.waf_cloudfront.web_acl_arn
  price_class         = "PriceClass_200"  # US + EU + Asia for production
  tags                = local.common_tags

  providers = {
    aws = aws.us_east_1
  }
}

# ── IAM Roles ─────────────────────────────────────────────────
module "iam" {
  source = "../../modules/iam"

  name_prefix                = local.name_prefix
  environment                = local.env
  github_repo                = var.github_repo
  secrets_manager_arn        = module.secrets.secret_arn
  ecr_repository_arn         = module.ecr.repository_arn
  frontend_bucket_name       = module.frontend.s3_bucket_name
  cloudfront_distribution_id = module.frontend.cloudfront_distribution_id
  enable_ecs_exec            = false  # disabled in production
  create_oidc_provider       = true
  tags                       = local.common_tags
}

# ── Secrets Manager ───────────────────────────────────────────
module "secrets" {
  source = "../../modules/secrets"

  secret_path            = "ecommerce/production"
  environment            = local.env
  ecs_execution_role_arn = module.iam.ecs_execution_role_arn
  recovery_window_days   = 30  # longer recovery window for production data
  tags                   = local.common_tags

  depends_on = [module.iam]
}

# ── ALB + ACM Certificate ─────────────────────────────────────
module "route53" {
  source = "../../modules/route53"

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
  source = "../../modules/alb"

  name_prefix                = local.name_prefix
  vpc_id                     = module.vpc.vpc_id
  public_subnet_ids          = module.vpc.public_subnet_ids
  alb_security_group_id      = module.vpc.alb_security_group_id
  acm_certificate_arn        = module.route53.api_certificate_arn
  app_port                   = 4000
  enable_deletion_protection = true  # prevent accidental ALB deletion in prod
  tags                       = local.common_tags

  depends_on = [module.route53]
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = module.alb.alb_arn
  web_acl_arn  = module.waf_alb.web_acl_arn
}

# ── ECS ───────────────────────────────────────────────────────
module "ecs" {
  source = "../../modules/ecs"

  name_prefix           = local.name_prefix
  aws_region            = var.aws_region
  container_name        = "backend"
  container_image       = "${module.ecr.repository_url}:latest"  # CI/CD updates this
  app_port              = 4000
  task_cpu              = 512
  task_memory           = 1024
  desired_count         = 2
  min_tasks             = 2
  max_tasks             = 10
  execution_role_arn    = module.iam.ecs_execution_role_arn
  task_role_arn         = module.iam.ecs_task_role_arn
  target_group_arn      = module.alb.target_group_arn
  private_subnet_ids    = module.vpc.private_subnet_ids
  ecs_security_group_id = module.vpc.ecs_security_group_id
  secrets_manager_arn   = module.secrets.secret_arn
  use_spot              = false  # pure Fargate for production reliability
  enable_execute_command = false
  log_retention_days    = 365
  tags                  = local.common_tags

  depends_on = [module.alb, module.secrets, module.iam]
}

# ── Monitoring ────────────────────────────────────────────────
module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix                = local.name_prefix
  ecs_cluster_name           = module.ecs.cluster_name
  ecs_service_name           = module.ecs.service_name
  alb_arn_suffix             = module.alb.alb_arn
  target_group_arn_suffix    = module.alb.target_group_arn
  cloudfront_distribution_id = module.frontend.cloudfront_distribution_id
  alert_emails               = var.alert_emails
  tags                       = local.common_tags
}
