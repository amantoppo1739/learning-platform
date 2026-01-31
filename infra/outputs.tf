output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

output "log_group_name" {
  description = "CloudWatch log group for ECS"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "public_subnet_ids" {
  description = "Public subnet IDs (for ALB or direct access)"
  value       = aws_subnet.public[*].id
}
