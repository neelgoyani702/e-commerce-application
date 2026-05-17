# ── Production environment variable values ─────────────────
# Replace all placeholder values before running terraform apply.

aws_region    = "ap-south-1"
github_repo   = "your-github-org/e-commerce-application"

# Get this from: aws route53 list-hosted-zones
route53_zone_id = "ZXXXXXXXXXXXXXXXXXXXXX"

frontend_domain = "yourdomain.com"
api_domain      = "api.yourdomain.com"

# ACM certificate in us-east-1 covering *.yourdomain.com + yourdomain.com
# Create manually in AWS Console (us-east-1 region) and paste the ARN here
acm_certificate_arn_us_east_1 = "arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

alert_emails = ["your-team@yourdomain.com"]
