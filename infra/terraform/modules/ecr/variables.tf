variable "repository_name" {
  type = string
}

variable "max_image_count" {
  description = "ECR lifecycle: keep this many images, expire the rest"
  type        = number
  default     = 10
}

variable "tags" {
  type    = map(string)
  default = {}
}
