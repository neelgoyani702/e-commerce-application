variable "name_prefix" { type = string }
variable "scope" {
  type        = string
  description = "CLOUDFRONT (us-east-1 only) or REGIONAL (ALB, same region)"
  validation {
    condition     = contains(["CLOUDFRONT", "REGIONAL"], var.scope)
    error_message = "scope must be CLOUDFRONT or REGIONAL"
  }
}
variable "tags" { type = map(string); default = {} }
