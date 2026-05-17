terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

# ── Secrets Manager Secret ────────────────────────────────────
# Stores all 14 backend env vars as a single JSON object.
# The ECS task definition references individual keys within this secret.
#
# IMPORTANT: Terraform manages the secret *shell* (name, policy, rotation config)
# but NOT the secret value. Populate the value via:
#   aws secretsmanager put-secret-value \
#     --secret-id <arn> \
#     --secret-string '{"MONGO_URL":"...","JWT_SECRET":"...",...}'
resource "aws_secretsmanager_secret" "backend" {
  name                    = "${var.secret_path}/backend"
  description             = "Backend env vars for ${var.environment} environment"
  recovery_window_in_days = var.recovery_window_days

  tags = var.tags
}

# Resource policy: only the ECS task execution role can read this secret
resource "aws_secretsmanager_secret_policy" "backend" {
  secret_arn = aws_secretsmanager_secret.backend.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECSExecutionRole"
        Effect = "Allow"
        Principal = {
          AWS = var.ecs_execution_role_arn
        }
        Action   = "secretsmanager:GetSecretValue"
        Resource = "*"
      }
    ]
  })
}
