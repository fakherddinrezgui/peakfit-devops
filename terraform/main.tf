terraform {
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

# ── VPC ────────────────────────────────────────────────────────
resource "aws_vpc" "peakfit" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "peakfit-vpc" }
}

# ── Sous-réseaux publics ────────────────────────────────────────
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.peakfit.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "peakfit-subnet-1" }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.peakfit.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "peakfit-subnet-2" }
}

# ── Passerelle Internet ─────────────────────────────────────────
resource "aws_internet_gateway" "peakfit" {
  vpc_id = aws_vpc.peakfit.id
  tags   = { Name = "peakfit-igw" }
}

# ── Table de routage ───────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.peakfit.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.peakfit.id
  }
  tags = { Name = "peakfit-rt" }
}

resource "aws_route_table_association" "sub1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "sub2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# ── Security Group ALB ─────────────────────────────────────────
resource "aws_security_group" "alb" {
  name   = "peakfit-sg-alb"
  vpc_id = aws_vpc.peakfit.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "peakfit-sg-alb" }
}

# ── Security Group EC2 ─────────────────────────────────────────
resource "aws_security_group" "ec2" {
  name   = "peakfit-sg-ec2"
  vpc_id = aws_vpc.peakfit.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "peakfit-sg-ec2" }
}

# ── AMI Amazon Linux 2 ────────────────────────────────────────
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# ── EC2 Instances ─────────────────────────────────────────────
resource "aws_instance" "peakfit" {
  count                  = var.instance_count
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = count.index == 0 ? aws_subnet.public_1.id : aws_subnet.public_2.id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = { Name = "peakfit-ec2-${count.index + 1}" }
}

# ── Load Balancer ─────────────────────────────────────────────
resource "aws_lb" "peakfit" {
  name               = "peakfit-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  tags               = { Name = "peakfit-alb" }
}

resource "aws_lb_target_group" "peakfit" {
  name     = "peakfit-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.peakfit.id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200,304"
  }
}

resource "aws_lb_target_group_attachment" "peakfit" {
  count            = var.instance_count
  target_group_arn = aws_lb_target_group.peakfit.arn
  target_id        = aws_instance.peakfit[count.index].id
  port             = 80
}

resource "aws_lb_listener" "peakfit" {
  load_balancer_arn = aws_lb.peakfit.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.peakfit.arn
  }
}
