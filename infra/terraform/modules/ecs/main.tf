terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

# ── ECS Cluster ───────────────────────────────────────────────
resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled" # Container Insights: CPU, memory, network per task
  }

  tags = var.tags
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = var.use_spot ? ["FARGATE", "FARGATE_SPOT"] : ["FARGATE"]

  default_capacity_provider_strategy {
    # Use Fargate Spot for dev/staging (70-90% cheaper); pure FARGATE for prod
    capacity_provider = var.use_spot ? "FARGATE_SPOT" : "FARGATE"
    weight            = 1
    base              = 1
  }
}

# ── CloudWatch Log Group ──────────────────────────────────────
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.name_prefix}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# ── ECS Task Definition ───────────────────────────────────────
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.name_prefix}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory

  # Execution role: pull from ECR, write CloudWatch logs, read Secrets Manager
  execution_role_arn = var.execution_role_arn
  # Task role: permissions the running container has (e.g. S3 for uploads)
  task_role_arn = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = var.container_image
      essential = true

      portMappings = [{ containerPort = var.app_port, protocol = "tcp" }]

      # All 14 env vars are stored as a single JSON secret in Secrets Manager.
      # ECS fetches the secret at container startup and injects as env vars.
      secrets = [
        for key in var.secret_keys : {
          name      = key
          valueFrom = "${var.secrets_manager_arn}:${key}::"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(var.app_port) }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.app_port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      # Hard limits: container is killed if exceeded (prevents runaway tasks)
      # Soft limits: ECS will try to reserve this but can burst above
      ulimits = [{ name = "nofile", softLimit = 65536, hardLimit = 65536 }]
    }
  ])

  tags = var.tags
}

# ── ECS Service ───────────────────────────────────────────────
resource "aws_ecs_service" "backend" {
  name                               = "${var.name_prefix}-backend-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = var.desired_count
  launch_type                        = var.use_spot ? null : "FARGATE"
  platform_version                   = "LATEST"
  health_check_grace_period_seconds  = 60
  force_new_deployment               = false
  enable_execute_command             = var.enable_execute_command # ECS Exec for debugging

  # Rolling update settings:
  # minimumHealthyPercent=50 → can bring down half the old tasks while new ones start
  # maximumPercent=200       → can briefly run double the desired count during deploy
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true  # stop deployment automatically if new tasks keep failing
    rollback = true  # revert to previous task definition on failure
  }

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false # tasks are in private subnets; use NAT for egress
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.container_name
    container_port   = var.app_port
  }

  dynamic "capacity_provider_strategy" {
    for_each = var.use_spot ? [1] : []
    content {
      capacity_provider = "FARGATE_SPOT"
      weight            = 1
      base              = 1
    }
  }

  lifecycle {
    # Prevent Terraform from overwriting image tag managed by CI/CD pipeline
    ignore_changes = [task_definition, desired_count]
  }

  tags = var.tags
}

# ── Autoscaling ───────────────────────────────────────────────
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.max_tasks
  min_capacity       = var.min_tasks
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.name_prefix}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 60 # scale out when CPU > 60%, scale in below
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
