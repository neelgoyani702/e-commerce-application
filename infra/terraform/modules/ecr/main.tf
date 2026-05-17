terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

resource "aws_ecr_repository" "main" {
  name                 = var.repository_name
  image_tag_mutability = "MUTABLE" # allow :latest tag to be overwritten

  image_scanning_configuration {
    scan_on_push = true # flag vulnerabilities before they land in ECS
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = var.tags
}

# Keep only the N most recent images per environment — controls storage costs
resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.max_image_count} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.max_image_count
        }
        action = { type = "expire" }
      }
    ]
  })
}
