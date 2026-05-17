variable "name_prefix" { type = string }
variable "environment" { type = string }
variable "github_repo" { type = string; description = "owner/repo format e.g. myorg/e-commerce" }
variable "secrets_manager_arn" { type = string }
variable "ecr_repository_arn" { type = string }
variable "frontend_bucket_name" { type = string }
variable "cloudfront_distribution_id" { type = string }
variable "enable_ecs_exec" { type = bool; default = false }
variable "create_oidc_provider" {
  type        = bool
  default     = true
  description = "Set false if GitHub OIDC provider already exists in this account"
}
variable "existing_oidc_provider_arn" {
  type    = string
  default = ""
}
variable "tags" { type = map(string); default = {} }
