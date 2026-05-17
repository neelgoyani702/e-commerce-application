variable "name_prefix" { type = string }
variable "bucket_name" { type = string }
variable "domain_aliases" { type = list(string); default = [] }
variable "acm_certificate_arn" { type = string; description = "Must be in us-east-1" }
variable "waf_web_acl_arn" { type = string; default = null; description = "WAF WebACL ARN (scope CLOUDFRONT, must be in us-east-1)" }
variable "price_class" { type = string; default = "PriceClass_100"; description = "PriceClass_100=US/EU, PriceClass_200=+Asia, PriceClass_All=global" }
variable "tags" { type = map(string); default = {} }
