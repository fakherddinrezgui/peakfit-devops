output "instance_public_ips" {
  description = "IPs publiques des EC2"
  value       = aws_instance.peakfit[*].public_ip
}

output "alb_dns_name" {
  description = "URL publique de PeakFit"
  value       = aws_lb.peakfit.dns_name
}
