variable "aws_region" { type = string; default = "ap-south-1" }
variable "github_repo" { type = string }
variable "route53_zone_id" { type = string }
variable "frontend_domain" { type = string }
variable "api_domain" { type = string }
variable "acm_certificate_arn_us_east_1" { type = string }
variable "oidc_provider_arn" { type = string }
variable "alert_emails" { type = list(string) }
