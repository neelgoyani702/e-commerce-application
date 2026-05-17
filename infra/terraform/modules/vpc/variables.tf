variable "name_prefix" {
  description = "Prefix for all resource names (e.g. ecommerce-prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to deploy subnets into (2 recommended)"
  type        = list(string)
}

variable "app_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 4000
}

variable "single_nat_gateway" {
  description = "Use one NAT Gateway instead of one-per-AZ (saves ~$33/month; trade HA for cost)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
