variable "name_prefix" { type = string }
variable "ecs_cluster_name" { type = string }
variable "ecs_service_name" { type = string }
variable "alb_arn_suffix" { type = string; description = "ALB ARN suffix (used in CloudWatch dimensions)" }
variable "target_group_arn_suffix" { type = string }
variable "cloudfront_distribution_id" { type = string; default = "" }
variable "alert_emails" { type = list(string); description = "Email addresses to receive CloudWatch alarm notifications" }
variable "tags" { type = map(string); default = {} }
