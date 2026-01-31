variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name (Learning Platform / Synta)"
  type        = string
  default     = "learning-platform"
}

variable "environment" {
  description = "Environment (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "container_image" {
  description = "Full URI of the container image (e.g. ghcr.io/org/repo:latest)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "Task CPU units (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory_mb" {
  description = "Task memory in MB"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Port the app listens on"
  type        = number
  default     = 3000
}
