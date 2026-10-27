# InternFlow — Production Deployment Checklist

Use this checklist before, during, and after deploying InternFlow to ensure high availability, data integrity, and strict security compliance.

---

## 1. Pre-Deployment Readiness (Local & Codebase)

- [x] **Backend Tests**: All 45 unit & integration tests pass with 0 failures (`mvn test`).
- [x] **Frontend Tests**: All 67 Vitest unit & integration tests pass with 0 failures (`npm test -- --run`).
- [x] **Frontend Production Build**: `npm run build` generates production assets into `dist/` cleanly.
- [x] **SPA Routing**: `frontend/public/_redirects` created with `/* /index.html 200`.
- [x] **API Base URL Support**: `frontend/src/api/client.ts` supports dynamic `import.meta.env.VITE_API_BASE_URL`.
- [x] **Database Migrations**: Flyway scripts `V1__init_schema.sql` through `V5__fix_document_paths_and_resume_urls.sql` validated.
- [x] **Cloud Database URL Parsing**: `DatabaseUrlEnvironmentPostProcessor` converts `postgres://` to `jdbc:postgresql://` automatically.
- [x] **Dynamic Port Binding**: `server.port` configured to `${PORT:8080}` for cloud host dynamic allocation.
- [x] **Document Storage Abstraction**: `StorageService` interface implemented with `LocalStorageService` and `S3StorageService` (Cloudflare R2 / AWS S3).
- [x] **Non-Root Container**: Dockerfile configured to run as dedicated system user `internflow` (UID 1001).

---

## 2. Infrastructure Provisioning Checklist (Render / Cloud)

- [ ] **PostgreSQL Database**:
  - [ ] Provisioned PostgreSQL 16 instance.
  - [ ] Database credentials and internal connection string copied securely.
  - [ ] Automated daily snapshots / backups enabled.
- [ ] **Backend Web Service**:
  - [ ] Runtime set to Docker, root directory `backend`, Dockerfile `Dockerfile`.
  - [ ] Health check path set to `/actuator/health`.
  - [ ] Memory allocation set to at least 512MB RAM (Standard instance).
  - [ ] Environment variables configured:
    - [ ] `SPRING_PROFILES_ACTIVE=prod`
    - [ ] `DATABASE_URL` set to Postgres connection string
    - [ ] `JWT_SECRET` (minimum 32-byte high-entropy string)
    - [ ] `CORS_ALLOWED_ORIGINS` (exact frontend URL, e.g. `https://internflow-frontend.onrender.com`)
    - [ ] `STORAGE_TYPE` (`local` with persistent disk or `s3` with R2)
- [ ] **Frontend Static Site**:
  - [ ] Root directory `frontend`.
  - [ ] Build command: `npm ci && npm run build`.
  - [ ] Publish directory: `dist`.
  - [ ] Environment variable `VITE_API_BASE_URL` set to `https://<backend-domain>/api`.
  - [ ] Environment variable `VITE_ENABLE_DEMO_LOGIN=false`.
  - [ ] SPA rewrite rule configured: `/*` -> `/index.html`.
- [ ] **Object Storage (Optional / Cloudflare R2)**:
  - [ ] R2 bucket created (e.g. `internflow-documents`).
  - [ ] API Token generated with read/write access to bucket.
  - [ ] `S3_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` set on backend.

---

## 3. Post-Deployment Smoke Test (Verification)

After deployment completes, verify these critical workflows in production:

1. **System Health Check**:
   - Access `https://<backend-domain>/actuator/health` in browser or curl.
   - Expected status: `{"status":"UP"}`.
2. **Homepage & Static Assets**:
   - Visit `https://<frontend-domain>`.
   - Verify warm Campus Ledger theme loads with CSS styles and images.
3. **Client-Side Routing / Refresh**:
   - Navigate to `/login` and `/register/student`.
   - Perform a hard browser refresh (Ctrl+F5).
   - Expected: Page reloads cleanly without 404 error.
4. **Student Registration & Login**:
   - Register a new student account.
   - Verify JWT token is received and user profile is initialized in PostgreSQL.
5. **Resume Upload & Download**:
   - In student profile, upload a sample PDF resume.
   - Verify upload status is successful.
   - Click **View / Preview**; verify authenticated preview modal opens without HTTP 403.
   - Click **Download**; verify document downloads with correct filename.
6. **Recruiter Pipeline Verification**:
   - Log in as employer/recruiter.
   - Navigate to **Applicant Pipeline**.
   - Click candidate resume button; verify preview modal renders without 404 or permission denial.
7. **Offers & Day 1 Joining Workflow**:
   - Navigate to student offers page.
   - Verify accepted offers display the **Confirm Day 1 Joining** button.
   - Confirm joining and verify status transitions to `JOINED` without `Offer cannot be responded to in state: ACCEPTED` error.

---

## 4. Rollback & Disaster Recovery Procedure

- **Frontend Rollback**:
  - In Render Dashboard > `internflow-frontend` > **Deploys**, select previous successful commit and click **Rollback**.
- **Backend Rollback**:
  - In Render Dashboard > `internflow-backend` > **Deploys**, select previous successful image and click **Rollback**.
- **Database Backup Restoration**:
  - If a migration failure occurs, restore the latest automated snapshot from Render Dashboard > `internflow-postgres` > **Backups**.
