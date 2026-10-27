# InternFlow — End-to-End Production Deployment Guide

This guide provides the complete, tested procedure for deploying InternFlow to cloud production using **Render** (IaC Blueprint or Manual Dashboard), **Docker**, **Managed PostgreSQL 16**, and **Cloudflare R2 / AWS S3 Object Storage**.

---

## 1. System Architecture Overview

```
                                  +------------------------------------+
                                  |         Internet / End Users       |
                                  +-----------------+------------------+
                                                    |
                         +--------------------------+--------------------------+
                         | HTTPS (SSL/TLS)                                     | HTTPS (REST API)
                         v                                                     v
          +-------------------------------+                     +-------------------------------+
          |       Render Static Site      |                     |       Render Web Service      |
          |       (internflow-frontend)   |                     |       (internflow-backend)    |
          |-------------------------------|                     |-------------------------------|
          | - React 18 + TS + Tailwind    |                     | - Eclipse Temurin 21 JRE      |
          | - Client-side SPA Routing     |                     | - Spring Boot 3.3.4 (MVC)     |
          | - _redirects: /* /index 200   |                     | - Spring Security 6 (JWT)     |
          | - Base URL: VITE_API_BASE_URL |                     | - Non-root container (1001)   |
          +-------------------------------+                     +---------------+---------------+
                                                                                |
                                            +-----------------------------------+-----------------------------------+
                                            | JDBC (SSL / Pool)                                                     | S3 API (HTTPS)
                                            v                                                                       v
                             +-------------------------------+                                       +-------------------------------+
                             |    Managed PostgreSQL 16      |                                       |     Cloudflare R2 / AWS S3    |
                             |    (internflow-postgres)      |                                       |     (Object Storage)          |
                             |-------------------------------|                                       |-------------------------------|
                             | - Flyway Migrations (V1 - V5) |                                       | - Private Bucket              |
                             | - ACID Persistence           |                                       | - Resumes & Offer Letters     |
                             | - Auto-reconnecting HikariCP  |                                       | - Local disk storage fallback |
                             +-------------------------------+                                       +-------------------------------+
```

---

## 2. Option A: Automated One-Click Deployment via Render Blueprint (Recommended)

InternFlow includes an infrastructure-as-code blueprint file at the repository root: [`render.yaml`](file:///C:/Users/Rathlavath/.gemini/antigravity/scratch/internflow/render.yaml).

### Steps to Deploy with Blueprint:

1. Push your Git repository to GitHub or GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your `internflow` repository.
5. Render reads `render.yaml` and provisions:
   - **Database**: `internflow-postgres` (PostgreSQL 16)
   - **Backend Service**: `internflow-backend` (Docker container running Java 21)
   - **Frontend Site**: `internflow-frontend` (Static Site built from `frontend/dist`)
6. Review the declared environment variables and click **Apply**.
7. Once created, note your deployed URLs:
   - Backend URL: `https://internflow-backend.onrender.com`
   - Frontend URL: `https://internflow-frontend.onrender.com`
8. In the Render Dashboard under `internflow-backend` > **Environment**, verify `CORS_ALLOWED_ORIGINS` includes your frontend domain.

---

## 3. Option B: Manual Step-by-Step Deployment on Render

If you prefer provisioning services individually through the Render Web UI:

### Step 1: Provision Managed PostgreSQL 16
1. In Render, click **New +** > **PostgreSQL**.
2. **Name**: `internflow-postgres`
3. **Database**: `internflow_db`
4. **User**: `internflow_user`
5. **Region**: Choose a region close to your users (e.g. `Oregon (US West)` or `Frankfurt (EU Central)`).
6. **Plan**: `Starter` (or `Free` for testing).
7. Click **Create Database**.
8. Once provisioned, copy the **Internal Database URL** (for services within Render) or **External Database URL**.

### Step 2: Deploy the Spring Boot Backend Web Service
1. In Render, click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `internflow-backend`
   - **Region**: Same as your PostgreSQL database.
   - **Language**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: `Standard` (min 512MB RAM recommended for Java 21 JRE).
4. Configure **Health Check Path**: `/actuator/health`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile & Flyway |
   | `DATABASE_URL` | *(paste your Render Postgres internal URL)* | Automatically parsed to JDBC by `DatabaseUrlEnvironmentPostProcessor` |
   | `JWT_SECRET` | *(64-character random hex string)* | Generate with `openssl rand -hex 32` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend-name.onrender.com` | Comma-separated list without trailing slashes |
   | `STORAGE_TYPE` | `local` (or `s3`) | Use `s3` if using Cloudflare R2 |
   | `UPLOAD_DIR` | `/app/storage` | Local disk upload directory |
6. (Optional) Under **Disks**, add a persistent disk:
   - **Name**: `internflow-storage`
   - **Mount Path**: `/app/storage`
   - **Size**: `1 GB`
7. Click **Create Web Service**.
8. Monitor the build logs:
   - Maven packages the application with dependencies cached.
   - Flyway executes schema migrations `V1` through `V5`.
   - Spring Boot reports: `Started InternFlowApplication in X.XX seconds`.

### Step 3: Deploy the React Static Site
1. In Render, click **New +** > **Static Site**.
2. Connect your Git repository.
3. Configure settings:
   - **Name**: `internflow-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://internflow-backend.onrender.com/api` | Points directly to your deployed backend |
   | `VITE_ENABLE_DEMO_LOGIN` | `false` | Disables demo quick-login credentials in production |
5. Under **Redirects / Rewrites**, verify:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   *(Render also automatically reads `frontend/public/_redirects` which is bundled into `dist`)*.
6. Click **Create Static Site**.

---

## 4. Cloudflare R2 Object Storage Integration

For enterprise production setups where resumes and offer letters should not rely on a single server's local disk, configure Cloudflare R2:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) > **R2 Object Storage**.
2. Click **Create Bucket**:
   - Bucket Name: `internflow-documents`
   - Location: `Automatic`
3. Click **Manage R2 API Tokens** > **Create API Token**:
   - Permissions: `Object Read & Write`
   - Specify bucket: `internflow-documents`
   - TTL: Permanent or as required.
4. Note your credentials:
   - **Account ID**
   - **Access Key ID**
   - **Secret Access Key**
   - **S3 Endpoint**: `https://<account_id>.r2.cloudflarestorage.com`
5. In your Render Backend service environment variables, set:
   ```env
   STORAGE_TYPE=s3
   S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET_NAME=internflow-documents
   S3_ACCESS_KEY_ID=<your_r2_access_key>
   S3_SECRET_ACCESS_KEY=<your_r2_secret_key>
   S3_PATH_STYLE_ACCESS=true
   ```
6. Redeploy the backend. InternFlow's `S3StorageService` will automatically activate.

---

## 5. Local Docker Compose Verification

To test the complete production container stack locally before deploying to the cloud:

```bash
# From repository root:
docker compose -f docker/docker-compose.yml up --build -d
```

- Accessible at:
  - Frontend: `http://localhost:3000` or `http://localhost:80`
  - Backend API: `http://localhost:8080/api`
  - Health Endpoint: `http://localhost:8080/actuator/health`
  - OpenAPI Docs: `http://localhost:8080/swagger-ui.html`

---

## 6. Troubleshooting & Diagnostics

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **CORS error in browser console** | `CORS_ALLOWED_ORIGINS` does not match the frontend URL. | Add exact frontend origin (e.g. `https://internflow-frontend.onrender.com`) to `CORS_ALLOWED_ORIGINS` in backend environment settings. Note: Do not include trailing slashes. |
| **404 Not Found on browser refresh** | Client-side routing not rewritten to `index.html`. | Ensure `frontend/public/_redirects` contains `/* /index.html 200` and Render Static Site has rewrite rule `/* -> /index.html`. |
| **Database connection refused** | Backend trying to connect to localhost DB in production. | Verify `DATABASE_URL` is set to the Render Postgres connection string and `SPRING_PROFILES_ACTIVE=prod`. |
| **Port bind error** | Hardcoded port mismatch. | InternFlow's `application.yml` uses `server.port: ${PORT:8080}`, automatically honoring Render's dynamic `$PORT`. |
| **Out of memory during build** | Default container memory limit exceeded. | In Dockerfile, `JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"` is configured for predictable footprint. Use Standard instance (512MB+). |
