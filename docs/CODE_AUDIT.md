# InternFlow — Comprehensive Codebase Audit Report

## 1. Executive Summary

**Project:** InternFlow — End-to-End Internship & Placement Management System  
**Architecture:** Decoupled Full-Stack Web Application  
- **Backend:** Java 21 / 23 LTS, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Flyway, PostgreSQL 16, Maven 3.9.9  
- **Frontend:** React 18, TypeScript (strict), Vite 5.4, Tailwind CSS, TanStack Query, Lucide React, Vitest  
- **Deployment:** Docker & Docker Compose, GitHub Actions CI Pipeline  
**Audit Date:** October 2026  
**Audit Scope:** Full repository inventory, architecture inspection, security posture review, API contract alignment, eligibility engine evaluation, test suite verification, and containerization readiness.

InternFlow provides complete placement lifecycle support for academic institutions—connecting students, recruiters, training & placement officers (TPO), faculty coordinators, and campus administrators. This audit identified critical security vulnerabilities, API contract discrepancies, and deployment misconfigurations, all of which were resolved and verified against the live test suites.

---

## 2. Codebase Structure & Component Inventory

```
internflow/
├── backend/
│   ├── src/main/java/com/internflow/
│   │   ├── config/              # SecurityConfig, WebConfig, OpenApiConfig, StorageProperties
│   │   ├── common/              # ApiResponse, PageResponse, GlobalExceptionHandler, BaseEntity
│   │   ├── security/            # JwtAuthenticationFilter, JwtTokenProvider, UserDetailsServiceImpl
│   │   └── modules/
│   │       ├── user/            # User entity, UserRepository, AuthController, Role enum
│   │       ├── student/         # StudentProfile, AcademicRecord, StudentService, StudentController
│   │       ├── company/         # CompanyProfile, CompanyApproval, CompanyController
│   │       ├── internship/      # Internship, WorkMode, InternshipStatus, MatchingEngine
│   │       ├── application/     # Application, ApplicationStatus, ApplicationService
│   │       ├── interview/       # InterviewRound, InterviewService, InterviewController
│   │       ├── offer/           # PlacementOffer, OfferStatus, OfferService, OfferController
│   │       ├── drive/           # PlacementDrive, PlacementDriveService, PlacementDriveController
│   │       ├── document/        # Document, DocumentType, DocumentService, DocumentController
│   │       ├── eligibility/     # EligibilityRule, EligibilityEngineService, EvaluationResult
│   │       ├── analytics/       # AnalyticsService, AnalyticsController (placement stats)
│   │       └── audit/           # AuditLog, AuditService, AuditLogController
│   ├── src/main/resources/
│   │   ├── db/migration/        # Flyway schema V1..V4 (PostgreSQL 16)
│   │   ├── application.yml      # Base configuration
│   │   ├── application-local.yml# Local dev profile with demo seeder
│   │   └── application-prod.yml # Production profile with strict environment binding
│   └── src/test/java/           # JUnit 5 & Mockito test suite
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client with defensive URL interceptor, typed services
│   │   ├── components/          # Layouts, Navbar, Sidebar, StatCard, MatchBadge, ProtectedRoute
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── student/         # Profile, Opportunities, Applications, Documents, Interviews
│   │   │   ├── company/         # Dashboard, PostInternship, ApplicantsPipeline, Interviews, Profile
│   │   │   └── admin/           # Dashboard, Approvals, Verification, PlacementDrives, AuditLogs
│   │   └── types/               # TypeScript interfaces matching backend models
│   └── src/test/                # Vitest & React Testing Library suites
├── docker/
│   ├── backend.Dockerfile       # Multi-stage Maven build container
│   ├── frontend.Dockerfile      # Multi-stage Nginx build container
│   ├── nginx.conf               # Production reverse proxy & API gateway
│   └── docker-compose.yml       # Orchestration for PostgreSQL 16, backend, and frontend
└── .github/workflows/
    └── ci.yml                   # Automated GitHub Actions CI pipeline
```

---

## 3. Discovered Defects & Vulnerability Assessment

### 3.1 Security Defects

| Issue ID | Category | Description | Severity | Remediated Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Information Disclosure | Demo data seeder (`DemoDataInitializer`) executed unconditionally, logging raw demo passwords into application logs in production environments. | **CRITICAL** | **RESOLVED**: Restricted to `@Profile("local")` with explicit `@ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true")`. Sanitized all logging. |
| **SEC-02** | Cryptographic Weakness | JWT secret had weak default and lacked runtime validation, allowing startup with unsafe keys. | **HIGH** | **RESOLVED**: Externalized `app.jwt.secret: ${JWT_SECRET}`. Enforced strict programmatic 256-bit key entropy verification during bean initialization. |
| **SEC-03** | Broken Access Control / IDOR | Uploaded resumes and transcripts under `/uploads/**` were statically served via `WebConfig` and bypassed security filters. | **CRITICAL** | **RESOLVED**: Removed static `/uploads/**` resource handler. Enforced authenticated streaming via `DocumentController` with strict ownership & role checks. |
| **SEC-04** | Privacy / BOLA | Student profile endpoints (`/api/students`) lacked role restrictions, permitting any authenticated user to enumerate student records. | **HIGH** | **RESOLVED**: Restricted batch enumeration to `TPO`, `FACULTY_COORDINATOR`, and `ADMIN`. Scoped candidate viewing for companies to applicants of their own postings. |
| **SEC-05** | Broken Authorization | Offer generation endpoint (`POST /api/offers`) allowed recruiters to issue offers on behalf of any company. | **HIGH** | **RESOLVED**: Bound offer creation to recruiter's authenticated company profile and verified valid application association. |
| **SEC-06** | State Machine Bypass | Offer status updates allowed students or companies to set invalid terminal states without validation. | **MEDIUM** | **RESOLVED**: Enforced strict state transitions (Student: `ACCEPTED`/`REJECTED`; Company: `REVOKED`/`JOINED`). |
| **SEC-07** | Information Leakage | `GET /api/internships/{id}` permitted unauthenticated inspection of unpublished draft or rejected internship roles. | **MEDIUM** | **RESOLVED**: Mandated authentication; routed public queries to `getPublishedInternshipById` requiring `status == PUBLISHED`. |
| **SEC-08** | Insecure CORS | CORS configured with wildcard `*` allowed arbitrary cross-origin request invocation. | **MEDIUM** | **RESOLVED**: Restricted CORS to configurable domain whitelists via `app.cors.allowed-origins`. |

---

### 3.2 API & Data Contract Inconsistencies

| Issue ID | Area | Discrepancy | Remediated Status |
| :--- | :--- | :--- | :--- |
| **API-01** | Routing / Proxy | Frontend components prefixed paths with `/api/`, resulting in duplicate `/api/api/...` when proxied by Axios with `baseURL: '/api'`. | **RESOLVED**: Implemented defensive URL stripper in Axios request interceptor and cleaned all call sites across all TSX files. |
| **API-02** | Placement Drives | Frontend sent JSON body with `name`, `startDate`, `endDate`, `batchYear`, `maxBacklogs` to `/api/placement-drives`, while backend DTO expected `driveName` and query params for status updates. | **RESOLVED**: Enhanced `CreatePlacementDriveRequest` and DTOs with property aliases/getters, and supported both query parameters and body payloads on PATCH/PUT status endpoints. |
| **API-03** | Offer Lifecycle | Frontend requested `GET /api/offers` and `GET /api/offers/company/{id}`, which were missing in backend `OfferController`. | **RESOLVED**: Implemented `GET /api/offers` (admin/staff) and `GET /api/offers/company/{companyId}` endpoints with security checks. |
| **API-04** | Interview Scheduling | Reschedule and feedback endpoints had mismatched parameter naming (`outcome` vs `status`) and lacked administrative overrides. | **RESOLVED**: Added alias mapping in `InterviewFeedbackRequest` and enabled TPO/Admin rescheduling privileges. |
| **ELIG-01**| Eligibility Rules | Student CGPA updates did not reset verification status, allowing tampered scores to satisfy automated criteria. | **RESOLVED**: Automated reset of `isVerified=false` upon academic updates; updated eligibility engine to flag unverified records with `AWAITING_VERIFICATION`. |
| **DATA-01**| Persistence | Application repository queried company by `User` ID instead of `CompanyProfile` ID, returning empty application lists. | **RESOLVED**: Resolved company via `companyRepository.findByUserId(userId)` before querying applications. |

---

### 3.3 DevOps & Containerization Defects

| Issue ID | File | Issue | Remediated Status |
| :--- | :--- | :--- | :--- |
| **DEP-01** | `backend.Dockerfile` | Attempted to run missing `./mvnw` script inside image build stage. | **RESOLVED**: Converted build stage to official `maven:3.9-eclipse-temurin-21` container with offline dependency caching. |
| **DEP-02** | `frontend.Dockerfile` | Attempted `COPY ../docker/nginx.conf`, which fails when context is `./frontend`. | **RESOLVED**: Co-located `nginx.conf` in `./frontend/` and updated Dockerfile `COPY` directive. Added GitHub Actions CI workflow in `.github/workflows/ci.yml`. |

---

## 4. Conclusion & Readiness

Following remediation, InternFlow is verified as a production-grade, secure, and robust full-stack solution. Both the frontend and backend pass all automated unit and integration tests with zero errors, and build cleanly for containerized production deployment.
