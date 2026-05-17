aws_region    = "ap-south-1"
github_repo   = "your-github-org/e-commerce-application"

route53_zone_id = "ZXXXXXXXXXXXXXXXXXXXXX"
frontend_domain = "staging.yourdomain.com"
api_domain      = "api.staging.yourdomain.com"

acm_certificate_arn_us_east_1 = "arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Copy from production terraform output: module.iam.oidc_provider_arn
oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"

alert_emails = ["your-team@yourdomain.com"]
