# Learning Platform (Synta) - AWS VPC, ECS Fargate, IAM
# Requires: container_image (e.g. from GitHub Actions → GHCR/ECR)

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch  = true
  tags = {
    Name = "${local.name_prefix}-public-${count.index + 1}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "${local.name_prefix}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# --- ECS ---
resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"
  tags = {
    Name = "${local.name_prefix}-cluster"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  default_capacity_provider_strategy {
    base              = 0
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# IAM: ECS task execution (pull image, write logs, get secrets)
resource "aws_iam_role" "ecs_execution" {
  name = "${local.name_prefix}-ecs-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM: ECS task role (for app to call AWS APIs if needed)
resource "aws_iam_role" "ecs_task" {
  name = "${local.name_prefix}-ecs-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# Optional: attach policies for Secrets Manager, CloudWatch, etc.
# resource "aws_iam_role_policy_attachment" "ecs_task_secrets" {
#   role       = aws_iam_role.ecs_task.name
#   policy_arn = aws_iam_policy.ecs_secrets.arn
# }

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${local.name_prefix}"
  retention_in_days  = 14
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.name_prefix
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory_mb
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  container_definitions = jsonencode([{
    name      = "app"
    image     = var.container_image
    essential = true
    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])
  tags = {
    Name = "${local.name_prefix}-task"
  }
}

resource "aws_ecs_service" "app" {
  name            = "${local.name_prefix}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }
  tags = {
    Name = "${local.name_prefix}-service"
  }
}

# Security group: allow inbound 3000 from ALB or public (dev); restrict in prod
resource "aws_security_group" "ecs" {
  name        = "${local.name_prefix}-ecs-sg"
  description = "ECS Fargate tasks"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${local.name_prefix}-ecs-sg"
  }
}
