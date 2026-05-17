variable "route53_zone_id" { type = string }
variable "frontend_domain" { type = string; description = "e.g. yourdomain.com or staging.yourdomain.com" }
variable "api_domain" { type = string; description = "e.g. api.yourdomain.com" }
variable "api_domain_sans" { type = list(string); default = [] }
variable "cloudfront_domain_name" { type = string }
variable "cloudfront_hosted_zone_id" { type = string }
variable "alb_dns_name" { type = string }
variable "alb_zone_id" { type = string }
variable "tags" { type = map(string); default = {} }
