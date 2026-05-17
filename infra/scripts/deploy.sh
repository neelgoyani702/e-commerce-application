#!/usr/bin/env bash
# deploy.sh — Force a new ECS deployment with the current task definition.
# Use this for emergency rollouts or when you need to force a task refresh
# without a new image (e.g., to pick up updated Secrets Manager values).
#
# Usage: ./infra/scripts/deploy.sh <environment> [aws-region]
# Example: ./infra/scripts/deploy.sh production ap-south-1

set -euo pipefail

ENV="${1:?Usage: deploy.sh <environment> [region]}"
REGION="${2:-ap-south-1}"
CLUSTER="ecommerce-${ENV}-cluster"
SERVICE="ecommerce-${ENV}-backend-service"

echo "Forcing new deployment on cluster=$CLUSTER service=$SERVICE"

aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --force-new-deployment \
  --region "$REGION" \
  --query "service.{status: status, desiredCount: desiredCount, runningCount: runningCount}" \
  --output table

echo "Deployment triggered. Monitor progress:"
echo "  aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
