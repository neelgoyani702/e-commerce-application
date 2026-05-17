variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo in owner/repo format, e.g. myorg/e-commerce"
}

variable "route53_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for your domain"
}

variable "frontend_domain" {
  type        = string
  description = "e.g. yourdomain.com"
}

variable "api_domain" {
  type        = string
  description = "e.g. api.yourdomain.com"
}

variable "acm_certificate_arn_us_east_1" {
  type        = string
  description = "ACM wildcard cert ARN in us-east-1 (for CloudFront)"
}

variable "alert_emails" {
  type        = list(string)
  description = "Email addresses for CloudWatch alarm notifications"
}
