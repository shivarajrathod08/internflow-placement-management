# InternFlow — End-to-End Enterprise Internship & Placement SaaS Platform

[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 21/23](https://img.shields.io/badge/Java-21%20%2F%2023-orange.svg)](https://www.oracle.com/java/)
[![React 18](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Flyway Migrations](https://img.shields.io/badge/Flyway-10.10-red.svg)](https://flywaydb.org/)
[![License](https://img.shields.io/badge/License-Proprietary-gray.svg)]()

> **InternFlow** is a production-grade, enterprise SaaS platform connecting **Students**, **Corporate Recruiters**, and **University Placement Cells** across the entire lifecycle:
> `Discovery → AI Match → Application → Screening → Interview Scheduling → Selection → Joining → Document KYC → Completion → Real Analytics`.

---

## 🌟 Key Architectural Highlights

1. **Strict 12-Stage Application State Machine**:
   - `APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `INTERVIEW_COMPLETED` → `SELECTED` → `JOINED` → `IN_PROGRESS` → `COMPLETION_SUBMITTED` → `VERIFICATION_PENDING` → `COMPLETED` (or terminal `REJECTED`, `WITHDRAWN`).
   - Prevents unauthorized state skips or illegal transitions via domain-enforced state machine validation.

2. **5-Factor Explainable Smart Matching Engine**:
   - Deterministic 0–100% scoring with exact points breakdown and remediation advice:
     - Required Skills Match: **40%**
     - Preferred Skills Match: **20%**
     - Experience & Projects: **15%**
     - Academic CGPA & Eligibility: **15%**
     - Profile Completeness: **10%**

3. **Canonical Skill Taxonomy & Alias Normalization**:
   - 40+ canonical industry skills categorized into Programming Languages, Frameworks, Cloud & DevOps, Databases, and Core CS.
   - Intelligent alias mapping (`JS` → `JavaScript`, `K8s` → `Kubernetes`, `Spring` → `Spring Boot`).

4. **Secure Document Verification & KYC**:
   - Safe multipart document uploads (Offer Letters, Joining Reports, Completion Certificates).
   - Strict MIME type verification, file size limits, and access-controlled streaming downloads.

5. **Live Database Analytics (Zero Mock Data)**:
   - High-performance SQL aggregations delivering realtime institutional funnel conversion rates (Shortlist Rate, Selection Rate, Completion Rate).

6. **Tamper-Resistant Audit Trail**:
   - Immutable security log capturing every login, status mutation, verification decision, and administrative action with timestamps, actor IDs, and IP addresses.

---

## 🚀 Pre-Configured Demo Credentials

The platform auto-seeds realistic platform data on first boot. You can log in using the one-click demo credentials on the login screen or manually:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Placement Admin** | `admin@internflow.edu` | `Password@123` | Full Institutional Metrics, Placement Drives, KYC, Audits |
| **Training & Placement Officer (TPO)** | `tpo@internflow.edu` | `Password@123` | Placement Drives, Candidate Verification, Offers Oversight |
| **Faculty Coordinator** | `coordinator@internflow.edu` | `Password@123` | Department KYC Review, Student Academic Verification |
| **Verified Recruiter** | `recruiter@google.com` | `Password@123` | Postings, Candidate Pipeline, Interview Scheduling, Offer Issuance |
| **Pending Recruiter** | `recruiter@startup.io` | `Password@123` | Draft Postings (Awaiting Admin KYC Approval) |
| **Student (Placed)** | `student@college.edu` | `Password@123` | Profile, Applications, Offer Acceptance, Day-1 Joining |
| **Student (Applicant)** | `student2@college.edu` | `Password@123` | Discovery, Transparent Smart Match, Active Applications |
| **Student (Junior)** | `student3@college.edu` | `Password@123` | Discovery, Skill Gap Recommendations |

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.3.4 (Java 21/23)
- **Data & ORM**: Spring Data JPA, Hibernate 6, Bean Validation (Jakarta)
- **Security**: Spring Security 6, Stateless JWT (`jjwt 0.12.6`), BCrypt hashing, CORS filter
- **Database**:
  - `prod`: PostgreSQL 16 with versioned Flyway migrations (`V1` to `V4`)
  - `local`: Embedded in-memory DB in PostgreSQL compatibility mode (`MODE=PostgreSQL`)
- **API Documentation**: Springdoc OpenAPI 2.6.0 (Swagger UI at `/swagger-ui/index.html`)
- **Actuator**: Spring Boot Actuator with `/actuator/health` and `/actuator/info`

### Frontend
- **Framework**: React 18, TypeScript 5.5 (strict mode), Vite 5.4
- **Styling & Icons**: Tailwind CSS 3.4, Lucide Icons
- **Visual Analytics**: Recharts 2.x
- **Form Management**: React Hook Form with Zod validation schemas
- **Testing**: Vitest with React Testing Library and JSDOM
- **Routing**: React Router v6 with Role-Based Access Control (`ProtectedRoute`)

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Java JDK 21 or 23 installed (`java -version`)
- Node.js 18+ and npm (`node -v`)

### 1. Run the Spring Boot Backend
```bash
cd backend
# Using Maven wrapper or installed Maven:
mvn spring-boot:run
```
- The backend starts on **`http://localhost:8080`**.
- OpenAPI / Swagger documentation: **`http://localhost:8080/swagger-ui/index.html`**.
- Actuator Health check: **`http://localhost:8080/actuator/health`**.

### 2. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open browser at **`http://localhost:5173`**.
- Automatically proxies `/api` requests to `http://localhost:8080/api`.

---

## 🐳 Running with Docker Compose

Run the production multi-tier stack (PostgreSQL 16 + Spring Boot + React/Nginx) with a single command:

```bash
cd docker
docker-compose up -d --build
```
- **Web Application**: `http://localhost` (or `http://localhost:3000`)
- **Backend API**: `http://localhost:8080/api`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui/index.html`
- **PostgreSQL 16 Database**: `localhost:5432` (`internflow_user` / `internflow_password`, db: `internflow`)

---

## 🧪 Automated Testing

Run all unit, state machine, matching engine, and end-to-end integration tests:

```bash
cd backend
.\mvnw.cmd test
```

### Key Test Suites:
- `MatchingEngineTest.java`: Validates 5-factor scoring math, skill gap calculations, and eligibility constraints.
- `ApplicationStateMachineTest.java`: Enforces legal status transitions and asserts illegal state skipping throws exceptions.
- `InternFlowIntegrationTest.java`: Simulates end-to-end authentication, JWT generation, and protected API authorization.

---

## 📂 Project Structure

```
internflow/
├── backend/                        # Spring Boot 3 Java Application
│   ├── src/main/java/com/internflow/
│   │   ├── common/                 # Global ApiResponse, PageResponse
│   │   ├── config/                 # SecurityConfig, CorsConfig, SwaggerConfig
│   │   ├── exception/              # GlobalExceptionHandler, Custom Exceptions
│   │   ├── modules/
│   │   │   ├── analytics/          # SQL aggregated platform KPIs
│   │   │   ├── application/        # Strict State Machine & Controller
│   │   │   ├── audit/              # Immutable security audit logs
│   │   │   ├── auth/               # Authentication & JWT tokens
│   │   │   ├── company/            # Company profiles & KYC verification
│   │   │   ├── document/           # Secure upload & verification service
│   │   │   ├── internship/         # Search, postings & admin approvals
│   │   │   ├── interview/          # Scheduling, scorecards & feedback
│   │   │   ├── matching/           # 5-Factor deterministic matching engine
│   │   │   ├── notification/       # Event-driven in-app notifications
│   │   │   ├── skill/              # Canonical taxonomy & alias resolution
│   │   │   ├── student/            # Student profiles, projects, experiences
│   │   │   └── user/               # User entities & Role enum
│   │   └── security/               # JwtUtils, JwtAuthenticationFilter
│   └── src/main/resources/
│       ├── db/migration/           # Flyway SQL migrations (V1, V2, V3)
│       └── application.yml         # Active profiles configuration
├── frontend/                       # React 18 / TypeScript / Vite Client
│   ├── src/
│   │   ├── api/                    # Axios client with JWT interceptor
│   │   ├── components/             # Reusable UI (Stepper, MatchModal, Badges)
│   │   ├── context/                # AuthContext, NotificationContext
│   │   ├── layouts/                # DashboardLayout, PublicLayout
│   │   ├── pages/
│   │   │   ├── admin/              # Approvals, Audits, Skills, Live Metrics
│   │   │   ├── auth/               # Login, Student/Company Registrations
│   │   │   ├── company/            # Postings, Pipeline, Interviews
│   │   │   ├── public/             # LandingPage, NotFound
│   │   │   └── student/            # Discovery, Match Breakdown, Documents
│   │   └── types/                  # Complete TypeScript domain contracts
│   └── package.json
├── docker/                         # Docker & Orchestration
│   ├── docker-compose.yml
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
└── docs/                           # Enterprise Architecture & Specs
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DATABASE.md
    └── SECURITY.md
```
