variable "name_prefix" { type = string }
variable "aws_region" { type = string }
variable "container_name" { type = string; default = "backend" }
variable "container_image" { type = string; description = "Full ECR image URI (updated by CI/CD)" }
variable "app_port" { type = number; default = 4000 }

variable "task_cpu" { type = number; default = 512 }
variable "task_memory" { type = number; default = 1024 }
variable "desired_count" { type = number; default = 2 }
variable "min_tasks" { type = number; default = 2 }
variable "max_tasks" { type = number; default = 10 }

variable "execution_role_arn" { type = string }
variable "task_role_arn" { type = string }
variable "target_group_arn" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }

variable "secrets_manager_arn" { type = string; description = "ARN of the Secrets Manager secret containing all backend env vars" }
variable "secret_keys" {
  type        = list(string)
  description = "Keys within the JSON secret to expose as container env vars"
  default = [
    "MONGO_URL", "JWT_SECRET", "JWT_EXPIRES_TIME",
    "SENDER_EMAIL", "SENDER_PASSWORD",
    "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
    "STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY",
    "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET",
    "CLIENT_URL"
  ]
}

variable "use_spot" {
  description = "Use Fargate Spot for cost savings (recommended for dev/staging, NOT production)"
  type        = bool
  default     = false
}

variable "enable_execute_command" {
  description = "Enable ECS Exec for live container debugging (disable in production)"
  type        = bool
  default     = false
}

variable "log_retention_days" { type = number; default = 30 }
variable "tags" { type = map(string); default = {} }
