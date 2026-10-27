# InternFlow — Production Security & Hardening Guide

This document defines the security architecture, controls, and compliance standards enforced in the production release of InternFlow.

---

## 1. Network & Transport Security

- **Strict HTTPS / TLS Termination**:
  - All public traffic to both the Frontend Static Site and Backend Web Service must be encrypted in transit using TLS 1.3 / 1.2.
  - Render provides automated, zero-configuration Let's Encrypt SSL/TLS certificates with auto-renewal.
- **Cross-Origin Resource Sharing (CORS)**:
  - Backend CORS is strictly restricted to authorized domains defined in `CORS_ALLOWED_ORIGINS`.
  - Wildcard `*` origins are prohibited when `allowCredentials(true)` is enabled.
  - Pre-flight requests (`OPTIONS`) validate allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (except local H2 console when active)
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 2. Authentication & Session Management

- **Stateless JWT Architecture**:
  - Spring Security is configured with `SessionCreationPolicy.STATELESS` — no server-side sessions or cookies to prevent CSRF vulnerabilities.
  - JWT tokens are signed using HMAC-SHA256 (`HS256`) with a cryptographically secure 256-bit secret key (`JWT_SECRET`).
  - Token validity is bounded to 24 hours (`86400000ms`), minimizing replay attack windows.
- **Password Security**:
  - Passwords stored in PostgreSQL are hashed using BCrypt with default strength factor 10.
  - Plaintext passwords are never logged or stored.
- **Demo Mode Isolation**:
  - In production (`SPRING_PROFILES_ACTIVE=prod`), `app.demo.seed-enabled` is hard-disabled (`false`).
  - Frontend demo quick-login credentials are hidden unless `VITE_ENABLE_DEMO_LOGIN=true` is explicitly passed.

---

## 3. Role-Based Access Control (RBAC) & Endpoint Authorization

InternFlow enforces least-privilege access across all REST endpoints using Spring Security and method-level security:

| Role | Permitted Actions |
| :--- | :--- |
| **Anonymous / Public** | View public landing page, browse active placement drives (`GET /api/internships/public/**`), user login (`POST /api/auth/login`), student & employer registration (`POST /api/auth/register/**`), health check (`GET /actuator/health`). |
| **STUDENT** | Manage personal profile, upload and download personal resume/documents, browse and apply to opportunities, view status of personal applications and offers, accept/reject offers, confirm Day 1 joining. |
| **COMPANY / RECRUITER** | Post internship listings, manage company profile, view candidate pipeline for own internships, download resumes of applicants to own listings, schedule interviews, issue offers. |
| **ADMIN / TPO** | Institutional management, user approval, system audits, placement drive scheduling, document verification, full metric observability. |

---

## 4. Document & Resume Storage Security

- **No Public S3 / Web Directory Exposure**:
  - Resumes and sensitive verification documents are **never exposed via public URLs**.
  - All download requests must pass through authenticated Spring Boot controller endpoints (`GET /api/documents/{id}/download` or `GET /api/applications/{id}/resume`).
- **Granular Document Ownership Verification**:
  - Students can only download their own uploaded documents.
  - Recruiters can only download documents for students who have actively submitted an application to their specific organization.
  - Attempts to access unauthorized documents immediately trigger `403 FORBIDDEN` and an audit log event.
- **Upload File Validation**:
  - MIME type whitelist: `application/pdf`, `image/jpeg`, `image/png`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
  - Content size restricted to maximum 10MB per file and 15MB per request.
  - Randomized UUID file naming prevents filename collision and directory scraping attacks.
- **Path Traversal Defense**:
  - All file path resolution checks explicitly reject `..` segments and normalize paths against the designated storage root.

---

## 5. Container & Runtime Hardening

- **Multi-Stage Docker Build**:
  - Build environment (`maven:3.9.9-eclipse-temurin-21`) is discarded after compilation.
  - Final runtime image uses `eclipse-temurin:21-jre-jammy`, minimizing attack surface and eliminating compilers/package managers from production.
- **Non-Root Execution**:
  - The container creates and runs as dedicated unprivileged user `internflow` (UID 1001).
  - Processes cannot modify system files or escalate privileges on the host.
- **Actuator Endpoint Protection**:
  - Only `/actuator/health` and `/actuator/info` are exposed publicly for container health probes.
  - Sensitive operational endpoints (`/actuator/env`, `/actuator/metrics`, `/actuator/beans`) require `ROLE_ADMIN` authentication.

---

## 6. Database & Persistence Protection

- **SQL Injection Prevention**:
  - 100% of database access is performed through Spring Data JPA / Hibernate parameterized queries.
- **Database Connection Security**:
  - Managed PostgreSQL connection strings enforce encrypted connections (`sslmode=require`).
  - Connection pooling via HikariCP bounds max active connections, preventing connection exhaustion attacks.
- **Auditing**:
  - Database table `audit_logs` records security-critical events (login, document upload, status transitions, admin approvals) with timestamp, actor, entity ID, and details.
