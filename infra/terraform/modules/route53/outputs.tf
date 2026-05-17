output "api_certificate_arn" { value = aws_acm_certificate_validation.api.certificate_arn }
output "frontend_dns_fqdn" { value = aws_route53_record.frontend.fqdn }
output "api_dns_fqdn" { value = aws_route53_record.api.fqdn }
