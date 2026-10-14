# InternFlow — Deployment & Operations Guide

## 1. Local Development (Standard & Docker Compose)

### Option A: Local Run (H2 PostgreSQL Mode / Standalone)
1. Backend:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
   Runs on `http://localhost:8080`. API documentation available at `http://localhost:8080/swagger-ui.html`.
2. Frontend:
   ```powershell
   cd frontend
   npm run dev
   ```
   Runs on `http://localhost:5173`. Proxies `/api` to `http://localhost:8080`.

### Option B: Docker Compose (PostgreSQL 16 + Backend + NGINX Frontend)
```bash
docker compose -f docker/docker-compose.yml up --build -d
```
- Services:
  - `postgres`: PostgreSQL 16 Alpine container mapped to port 5432 with health check.
  - `backend`: Spring Boot 3 Java 21 container connected to `postgres` via internal Docker network.
  - `frontend`: React SPA built with Vite and served via NGINX reverse-proxy on port 80.

## 2. Production AWS Cloud Architecture

```
Internet -> [CloudFront / Route53] -> [S3 Frontend Bucket]
                                  \-> [ALB] -> [ECS Fargate / EC2 Spring Boot App]
                                                    |
                                    +---------------+---------------+
                                    |                               |
                              [RDS PostgreSQL]               [S3 Private Resumes]
```

### Infrastructure Components:
1. **Frontend Hosting**: AWS S3 Static Website Hosting paired with AWS CloudFront CDN for global edge caching, SSL/TLS termination, and HTTP/2.
2. **Backend Services**: Containerized Spring Boot 3 application running on AWS ECS Fargate or App Runner with auto-scaling (minimum 2 tasks across AZs).
3. **Database**: Amazon RDS for PostgreSQL 16 (Multi-AZ, automated backups, encrypted at rest with AWS KMS).
4. **Private Documents**: Amazon S3 bucket with private ACL, server-side encryption (SSE-S3), pre-signed download URLs for authorized recruiters and placement staff.
5. **Environment Configuration**: Secrets stored in AWS Secrets Manager or Systems Manager Parameter Store.

## 3. Database Backup & Restore Plan
- Automated daily RDS snapshots retained for 30 days.
- Point-in-time recovery (PITR) window of 5 minutes.
- Manual pg_dump command for local/staging export:
  ```bash
  pg_dump -h <host> -U <user> -d internflow_db -F c -b -v -f internflow_backup.dump
  ```
