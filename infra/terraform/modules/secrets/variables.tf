variable "secret_path" { type = string; description = "e.g. ecommerce/production" }
variable "environment" { type = string }
variable "ecs_execution_role_arn" { type = string }
variable "recovery_window_days" { type = number; default = 7 }
variable "tags" { type = map(string); default = {} }
