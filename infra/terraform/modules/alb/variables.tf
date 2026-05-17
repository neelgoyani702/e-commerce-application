variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "alb_security_group_id" { type = string }
variable "acm_certificate_arn" { type = string }
variable "app_port" { type = number; default = 4000 }
variable "enable_deletion_protection" { type = bool; default = false }
variable "tags" { type = map(string); default = {} }
