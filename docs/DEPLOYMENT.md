# InternFlow — End-to-End Production & Free-Tier Deployment Guide

This guide provides the complete, tested procedure for deploying InternFlow to the cloud with **zero unexpected charges**, using **Render's Free Tier**, **Cloudflare R2 Object Storage (Free Tier)**, and either **Render Free PostgreSQL** or **Neon / Supabase Serverless PostgreSQL**.

---

## 1. Zero-Cost Infrastructure Architecture

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
          | - Plan: 100% Free             |                     | - Plan: Free (512 MB RAM)     |
          | - React 18 + TS + Tailwind    |                     | - Eclipse Temurin 21 JRE      |
          | - Client-side SPA Routing     |                     | - Spring Boot 3.3.4 (MVC)     |
          | - _redirects: /* /index 200   |                     | - Memory-tuned: -Xmx320m      |
          | - Base URL: VITE_API_BASE_URL |                     | - Non-root container (1001)   |
          +-------------------------------+                     +---------------+---------------+
                                                                                |
                                            +-----------------------------------+-----------------------------------+
                                            | JDBC (SSL / Auto-converted)                                           | Local Filesystem
                                            v                                                                       v
                             +-------------------------------+                                       +-------------------------------+
                             |    PostgreSQL Database        |                                       |     Container Local Storage   |
                             |  Render Free or Neon/Supabase |                                       |     (/app/storage)            |
                             |-------------------------------|                                       |-------------------------------|
                             | - Flyway Migrations (V1 - V5) |                                       | - Zero setup / Zero config    |
                             | - ACID Student/Offer Records  |                                       | - Full upload & view flow     |
                             | - Render: 30-day free lifespan|                                       | - Ephemeral (demo mode)       |
                             | - Neon/Supabase: No expiration|                                       | - Strict RBAC & Auth active   |
                             +-------------------------------+                                       +-------------------------------+
```

> [!NOTE]
> **Ephemeral Container Storage Notice (Demo Mode)**:
> In `STORAGE_TYPE=local` mode on Render's free tier, uploaded documents reside in the container's `/app/storage` directory. 
> Because Render free containers restart and spin down after 15 minutes of inactivity, any newly uploaded files during a session will be reset upon container restart. 
> Seed sample resumes (Alex Rivera, Emily Watson) are built directly into the application and will always remain viewable and downloadable. 
> When you are ready for permanent, persistent file storage, you can easily activate Cloudflare R2 by setting `STORAGE_TYPE=s3` and adding your bucket credentials.

---

## 2. Why Render Asked for Payment Information & How It Was Fixed

If Render prompted for a credit card during Blueprint deployment, it was caused by three specific declarations in the initial configuration:

1. **`plan: standard`**:
   The backend service and database were configured to `standard` (paid plans starting at $7 to $25/mo).
   - **Fix**: Updated both to `plan: free`.
2. **Persistent Disk (`disk:`)**:
   Render **charges $0.25/GB/month** for persistent disks and **prohibits disks on free-tier web services**.
   - **Fix**: Removed the `disk:` block completely. For the demo, `STORAGE_TYPE=local` uses container local storage at zero cost with zero credentials needed.
3. **Managed PostgreSQL Plan**:
   Render requires a paid subscription unless `plan: free` is specified.
   - **Fix**: Switched to `plan: free`.

---

## 3. Database Selection & The 30-Day Expiration Limitation

> [!IMPORTANT]
> **Render Free PostgreSQL 30-Day Expiration**:
> Render's free PostgreSQL tier is deleted exactly **30 days** after creation. Render sends email reminders, but if not upgraded, the database instance is wiped.

### Comparison: Render Free DB vs. External Free DB

| Feature | Render Free PostgreSQL | Neon Serverless PostgreSQL | Supabase Free PostgreSQL |
| :--- | :--- | :--- | :--- |
| **Cost** | 100% Free | 100% Free | 100% Free |
| **Credit Card Required?** | No | No | No |
| **Lifespan** | **Expires after 30 days** | **Never expires** | Never expires (pauses if inactive 7 days) |
| **Storage Limit** | 1 GB | 0.5 GB | 0.5 GB |
| **Setup Method** | Automated via `render.yaml` | Copy 1 connection string URL | Copy 1 connection string URL |

### Recommended Choices:
- **For immediate evaluation / demo**: Use Render's free PostgreSQL via the Blueprint. It requires zero configuration outside Render.
- **For a permanent portfolio project**: Provision a free database on [Neon.tech](https://neon.tech) (takes 1 minute, no credit card) and paste its connection URL into `DATABASE_URL`. InternFlow's `DatabaseUrlEnvironmentPostProcessor` automatically translates Neon's pooler URL to Spring Boot JDBC with SSL mode.

---

## 4. Option A: Automated One-Click Deployment via Render Blueprint (Demo Mode)

The updated [`render.yaml`](file:///C:/Users/Rathlavath/.gemini/antigravity/scratch/internflow/render.yaml) is configured for **100% Free-Tier services with zero external dependencies**.

### Deployment Steps:

1. Push your Git repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Connect your `internflow` repository.
4. Render parses `render.yaml` and presents the free service plan:
   - **`internflow-backend`**: Web Service (`plan: free`, Docker, Java 21, `STORAGE_TYPE=local`)
   - **`internflow-frontend`**: Static Site (`plan: free`, React + Vite)
   - **`internflow-postgres`**: PostgreSQL Database (`plan: free`)
5. Click **Apply**. Because all paid disks and Cloudflare R2 variables have been removed, Render will **not prompt for any credentials or payment information** and will deploy immediately.

---

## 5. Setting Up Free Cloudflare R2 Object Storage

Cloudflare R2 provides private, S3-compatible object storage with **10 GB free monthly storage and $0 data egress charges**:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) > **R2 Object Storage**.
2. Click **Create Bucket**:
   - Bucket Name: `internflow-documents`
   - Region: `Automatic`
3. Click **Manage R2 API Tokens** > **Create API Token**:
   - Token Name: `internflow-backend-token`
   - Permissions: `Object Read & Write`
   - Bucket: `internflow-documents`
4. Copy your credentials:
   - **Account ID** (visible on the R2 Overview page)
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint**: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
5. Supply these into your Render backend environment variables:
   ```env
   STORAGE_TYPE=s3
   S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET_NAME=internflow-documents
   S3_ACCESS_KEY_ID=<your_access_key_id>
   S3_SECRET_ACCESS_KEY=<your_secret_access_key>
   S3_PATH_STYLE_ACCESS=true
   ```

---

## 6. Free Tier Runtime Limits & Optimizations

### 1. Spring Boot 512 MB RAM Optimization
Render Free Web Services enforce a strict 512 MB memory limit. The backend Dockerfile is configured with:
```bash
JAVA_OPTS="-Xms128m -Xmx320m -XX:+UseG1GC -XX:MaxMetaspaceSize=128m -Djava.security.egd=file:/dev/./urandom"
```
This bounds total JVM memory well within 480 MB, preventing container crashes (Exit Code 137).

### 2. Free Tier Cold Starts
Render Free Web Services spin down after 15 minutes of inactivity. When a visitor navigates to the application:
- The React frontend static site loads instantly from edge CDN cache.
- The first API request to the backend may take 30 to 50 seconds while the free container spins up. Subsequent requests respond in milliseconds.
