# Setup, Development & Deployment Guide

One-stop guide for getting Synta (Learning Platform) running locally, developing, and deploying.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Setup](#2-setup)
3. [Development](#3-development)
4. [Deployment](#4-deployment)
5. [DevOps (Docker, CI/CD, Terraform, Observability)](#5-devops-docker-cicd-terraform-observability)
6. [Reference](#6-reference)

---

## 1. Prerequisites

- **Node.js** 20+ and **npm**
- **Git**
- (Optional) **Docker** and **Docker Compose** for containerized dev/deploy
- (Optional) **Terraform** 1.0+ for AWS infra

Accounts (free tiers work):

- [Neon](https://neon.tech) — PostgreSQL
- [Groq](https://console.groq.com/keys) — AI (Llama 3.1 8B)
- [Google Cloud](https://console.cloud.google.com) — YouTube Data API, OAuth
- [GitHub](https://github.com) — OAuth, CI/CD, GHCR

---

## 2. Setup

### 2.1 Clone and install

```bash
git clone <your-repo-url>
cd learning-platform
npm install
```

### 2.2 Environment variables

Copy the example env and fill in values:

```bash
cp .env.example .env.local
```

Edit `.env.local`. Required:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `DATABASE_URL` | Postgres connection string | [Neon](https://neon.tech) dashboard |
| `NEXTAUTH_SECRET` | Session signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) | Your base URL; use public URL in production |
| `GROQ_API_KEY` | AI (Llama 3.1 8B) | [Groq Console](https://console.groq.com/keys) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth | GitHub → Settings → Developer settings → OAuth Apps |
| `YOUTUBE_API_KEY` | YouTube Data API | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Enable YouTube Data API v3 → Credentials |

For **production**, use **GitHub Secrets** (for CI) or **AWS Secrets Manager** (for ECS). Never commit `.env` or `.env.local`.

### 2.3 Database

Create the DB (Neon gives you a connection string). Then run migrations:

```bash
npm run db:generate   # optional: only if you changed schema
npm run db:migrate
```

---

## 3. Development

### 3.1 Run locally (Node)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3.2 Run with Docker (app + Postgres)

Same app + a local Postgres in containers:

```bash
docker compose up --build
```

- App: [http://localhost:3000](http://localhost:3000)
- Postgres: `localhost:5432` (user: `synta`, db: `synta`, password: `synta`)

Set `DATABASE_URL=postgresql://synta:synta@localhost:5432/synta` in `.env.local` when using this, or use the `env_file` in `docker-compose.yml`.

If the app container cannot reach the internet (e.g. OAuth or APIs time out with `ETIMEDOUT`), the compose file uses explicit DNS (`8.8.8.8`, `8.8.4.4`). If it still fails, run the app on the host and only Postgres in Docker: `docker compose up db -d` then `npm run dev` with `DATABASE_URL=postgresql://synta:synta@localhost:5432/synta` in `.env.local`.

### 3.3 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |

### 3.4 Health check

- Local: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- Returns: `{ "status": "ok", "timestamp": "...", "service": "learning-platform" }`

---

## 4. Deployment

### 4.1 Build and run with Docker

```bash
docker build -t learning-platform .
docker run -p 3000:3000 --env-file .env.local learning-platform
```

Or use `docker-compose.yml`; for production, point `DATABASE_URL` and `NEXTAUTH_URL` at your prod DB and public URL.

### 4.2 CI/CD (GitHub Actions)

- **Workflow**: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- **On every PR**: `npm run lint` and `npm run build`
- **On push to `main`/`master`**: Build Docker image, run **Trivy** security scan, push to **GitHub Container Registry** (`ghcr.io/<org>/<repo>`)

To run **migrations** on deploy: add `DATABASE_URL` to GitHub Secrets and uncomment the `migrate` job in `deploy.yml`.

**Optional image registries:**

- **Amazon ECR**: Add a job that logs in with `aws-actions/amazon-ecr-login`, then tag and push the same image to your ECR repo.
- **Docker Hub**: Add `docker/login-action` with `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (GitHub Secrets), then push to `docker.io/your-org/learning-platform`.

### 4.3 Infrastructure (Terraform)

- **Location**: [infra/](infra/)
- **Resources**: VPC, public subnets, Internet Gateway, ECS Fargate cluster, task definition, service, IAM roles (execution + task), CloudWatch log group, security group.
- **State**: S3 backend (commented in `infra/backend.tf`). Create bucket + versioning + DynamoDB table for locking, then uncomment and run `terraform init`.

**Bootstrap S3 backend (run once):**

```bash
aws s3 mb s3://YOUR_TERRAFORM_STATE_BUCKET --region us-east-1
aws s3api put-bucket-versioning --bucket YOUR_TERRAFORM_STATE_BUCKET --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
```

Then in `infra/backend.tf`, uncomment and set `bucket`, `key`, `region`, `dynamodb_table`, and `encrypt = true`. Run:

```bash
cd infra
terraform init
terraform plan -var="container_image=ghcr.io/YOUR_ORG/YOUR_REPO:latest"
terraform apply
```

Copy `infra/terraform.tfvars.example` to `infra/terraform.tfvars` and set `container_image` (and any other variables) before running.

### 4.4 Secrets in production

- **CI**: Store `DATABASE_URL`, `NEXTAUTH_SECRET`, `GROQ_API_KEY`, OAuth keys, etc. in **GitHub Secrets**. Never commit `.env` or `.env.local`.
- **AWS**: Store production secrets in **AWS Secrets Manager**. Grant the ECS task execution role (or task role) permission to read those secrets, and inject them into the task definition (e.g. `secrets` in `container_definitions`) or use an entrypoint that fetches secrets before starting the app.

### 4.5 Migration pipeline (Drizzle)

- Run migrations during **deploy**: use `npx drizzle-kit migrate` (or `npm run db:migrate`) in CI or in a deploy script after the new image is built.
- In **GitHub Actions**: Uncomment the `migrate` job in `.github/workflows/deploy.yml` and add `DATABASE_URL` to **GitHub Secrets** (use Neon or RDS URL).
- For **ECS**: You can run a one-off Fargate task that executes the migration, or run migrations from a CI step before updating the ECS service.

---

## 5. DevOps (Docker, CI/CD, Terraform, Observability)

### 5.1 Containerization (Docker)

- **Dockerfile**: Multi-stage build (`node:20-alpine`) for a small final image. Repo root.
- **next.config.ts**: `output: "standalone"` for container-friendly builds.
- **.dockerignore**: Excludes `node_modules`, `.next`, `.git` to speed up builds.
- **docker-compose.yml**: App + local PostgreSQL for dev parity.

### 5.2 AWS Free Tier — Billing Alarm ($1)

1. In **AWS Console** → **Billing** → **Billing preferences**, enable **Receive Free Tier Usage Alerts**.
2. **CloudWatch** → **Alarms** → **Create alarm** → **Billing** → set threshold to **$1** and add an SNS topic (email) for notifications.

### 5.3 Observability

**Health check**

- **Endpoint**: `GET /api/health` → `{ "status": "ok", "timestamp": "...", "service": "learning-platform" }`.
- Used by ECS task health check (see `infra/main.tf`) and load balancers.

**Logging (Docker → CloudWatch)**

- ECS task definition in Terraform uses **awslogs** driver; container stdout/stderr stream to the CloudWatch log group `/ecs/learning-platform-dev` (name depends on `project_name` and `environment` in Terraform).
- View logs in **CloudWatch** → **Log groups** → select the log group.

**Monitoring (Grafana Cloud)**

1. Sign up at [Grafana Cloud](https://grafana.com/products/cloud/) (free tier).
2. Add a **data source**: Prometheus or CloudWatch (for AWS metrics).
3. For **request latency**: Use CloudWatch metrics for ALB/ECS, or add a small metrics exporter in the app and scrape with Prometheus. Create a dashboard with panels for latency (e.g. p50, p95) and error rate.

### 5.4 Quick reference

| Item | Location / Action |
|------|-------------------|
| Dockerfile | Repo root |
| docker-compose | Repo root |
| Lint & build | `.github/workflows/deploy.yml` (on PR) |
| Trivy scan | `.github/workflows/deploy.yml` (on push) |
| Image registry | GHCR by default; add ECR/Docker Hub in same workflow |
| Terraform | `infra/` (VPC, ECS Fargate, IAM, S3 backend) |
| Health | `GET /api/health` |
| Migrations | `npm run db:migrate` in CI or deploy step |
| Secrets | GitHub Secrets (CI) + AWS Secrets Manager (prod) |
| Logs | ECS → CloudWatch (configured in Terraform) |

---

## 6. Reference

| Topic | File |
|-------|------|
| Project overview, tech stack, structure | [README.md](README.md) |
| Env vars template | [.env.example](.env.example) |
| Terraform variables example | [infra/terraform.tfvars.example](infra/terraform.tfvars.example) |

---

**Quick start (local):** `npm install` → `cp .env.example .env.local` → fill env → `npm run db:migrate` → `npm run dev`
