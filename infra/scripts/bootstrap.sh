#!/usr/bin/env bash
# bootstrap.sh — Run this ONCE before the first `terraform init`.
# Creates the S3 state bucket and DynamoDB lock table for each environment.
# Safe to re-run: commands are idempotent.
#
# Prerequisites: AWS CLI configured with admin credentials.
# Usage: ./infra/scripts/bootstrap.sh ap-south-1

set -euo pipefail

REGION="${1:-ap-south-1}"
DYNAMODB_TABLE="ecommerce-tf-locks"

create_state_bucket() {
  local bucket="$1"
  echo "Creating S3 state bucket: $bucket"

  # ap-south-1 requires LocationConstraint; us-east-1 does not (AWS quirk)
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$bucket" --region "$REGION" 2>/dev/null || true
  else
    aws s3api create-bucket \
      --bucket "$bucket" \
      --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || true
  fi

  aws s3api put-bucket-versioning \
    --bucket "$bucket" \
    --versioning-configuration Status=Enabled

  aws s3api put-bucket-encryption \
    --bucket "$bucket" \
    --server-side-encryption-configuration '{
      "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
    }'

  aws s3api put-public-access-block \
    --bucket "$bucket" \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

  echo "  ✓ $bucket ready"
}

create_dynamodb_table() {
  echo "Creating DynamoDB lock table: $DYNAMODB_TABLE"
  aws dynamodb create-table \
    --table-name "$DYNAMODB_TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" 2>/dev/null || true
  echo "  ✓ DynamoDB table ready"
}

# One state bucket per environment
create_state_bucket "ecommerce-tf-state-prod"
create_state_bucket "ecommerce-tf-state-staging"
create_state_bucket "ecommerce-tf-state-dev"

create_dynamodb_table

echo ""
echo "Bootstrap complete. Now run:"
echo "  cd infra/terraform/environments/production && terraform init && terraform apply"
echo ""
echo "IMPORTANT: Deploy production first (it creates the GitHub OIDC provider)."
echo "Then copy module.iam.oidc_provider_arn from output into staging/dev terraform.tfvars."
