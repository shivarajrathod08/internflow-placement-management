# InternFlow — Engineering Repair & Remediation Log

This log details the complete set of source code, configuration, and architectural modifications implemented across InternFlow.

---

### Record ID: REP-SEC-01
- **Vulnerability / Defect:** SEC-01: Demo Data Seeder in Production & Password Logging
- **Files Modified:** `backend/src/main/java/com/internflow/modules/user/DemoDataInitializer.java`
- **Changes Applied:**
  - Added `@Profile("local")` and `@ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true")` annotations.
  - Sanitized logging output to ensure plaintext passwords are never output to application logs or console streams.
- **Verification:** Verified that bean is ignored when profile is not `local` or property is false.

---

### Record ID: REP-SEC-02
- **Vulnerability / Defect:** SEC-02: Insecure JWT Secret Configuration
- **Files Modified:**
  - `backend/src/main/resources/application.yml`
  - `backend/src/main/resources/application-prod.yml`
  - `backend/src/main/java/com/internflow/security/JwtTokenProvider.java`
- **Changes Applied:**
  - Replaced hardcoded secret references with externalized `${JWT_SECRET}`.
  - Implemented startup validation in `JwtTokenProvider` constructor checking key length >= 32 characters (256 bits).
- **Verification:** Unit tests and context initialization fail fast when weak secret is supplied.

---

### Record ID: REP-SEC-03 & FILE-01
- **Vulnerability / Defect:** SEC-03 & FILE-01: Insecure Document File Serving & Lack of IDOR Checks
- **Files Modified:**
  - `backend/src/main/java/com/internflow/config/WebConfig.java`
  - `backend/src/main/java/com/internflow/config/SecurityConfig.java`
  - `backend/src/main/java/com/internflow/modules/document/DocumentController.java`
  - `backend/src/main/java/com/internflow/modules/document/DocumentService.java`
- **Changes Applied:**
  - Removed static resource handler mapping `/uploads/**` to physical storage paths.
  - Removed `.requestMatchers("/uploads/**").permitAll()` from security filter chain.
  - Added `@PreAuthorize("isAuthenticated()")` to `DocumentController.downloadDocument`.
  - Enforced strict role-based and ownership checks in `DocumentService.loadFileAsResource` (owner student, institutional staff, or company recruiter with active application to their role).
- **Verification:** Unauthenticated requests receive HTTP 401; unauthorized cross-student downloads receive HTTP 403.

---

### Record ID: REP-SEC-04
- **Vulnerability / Defect:** SEC-04: Student Profile Enumeration & Candidate Match Privacy
- **Files Modified:** `backend/src/main/java/com/internflow/modules/student/StudentController.java`
- **Changes Applied:**
  - Restricted `getAllStudents` to `@PreAuthorize("hasAnyRole('TPO', 'FACULTY_COORDINATOR', 'ADMIN')")`.
  - Enforced recruiter validation in `getStudentById` and `getCandidateMatch` verifying candidate applied to the recruiter's company internship.
- **Verification:** Non-staff users attempting batch enumeration receive HTTP 403.

---

### Record ID: REP-SEC-05 & SEC-06 & API-03
- **Vulnerability / Defect:** SEC-05, SEC-06, API-03: Offer Security, State Transitions, and Missing Endpoints
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/offer/OfferStatus.java`
  - `backend/src/main/java/com/internflow/modules/offer/OfferService.java`
  - `backend/src/main/java/com/internflow/modules/offer/OfferController.java`
  - `backend/src/main/java/com/internflow/modules/offer/dto/OfferDTO.java`
  - `backend/src/main/java/com/internflow/modules/offer/dto/CreateOfferRequest.java`
  - `backend/src/main/java/com/internflow/modules/offer/dto/UpdateOfferStatusRequest.java`
  - `frontend/src/api/services.ts`
- **Changes Applied:**
  - Added `JOINED` and `REVOKED` states to `OfferStatus`.
  - Validated company ownership when creating offers in `OfferService`.
  - Added state machine rules restricting student updates to `ACCEPTED`/`REJECTED` and company updates to `REVOKED`/`JOINED`.
  - Added missing `GET /api/offers`, `GET /api/offers/all`, and `GET /api/offers/company/{companyId}` endpoints with security checks.
  - Aligned request/response DTOs with frontend contract (supporting `remarks`, `responseNotes`, `stipend`, `ctc`).
- **Verification:** Passed all backend test suites and verified type-safe contract with frontend.

---

### Record ID: REP-SEC-07
- **Vulnerability / Defect:** SEC-07: Public Internship Query Exposure
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/internship/InternshipService.java`
  - `backend/src/main/java/com/internflow/modules/internship/InternshipController.java`
- **Changes Applied:**
  - Added `getPublishedInternshipById` in `InternshipService`, enforcing `status == PUBLISHED` for public student views.
  - Added `@PreAuthorize("isAuthenticated()")` to `InternshipController.getInternshipById`.
- **Verification:** Unpublished draft or rejected roles return 404 or 403 to students.

---

### Record ID: REP-SEC-08
- **Vulnerability / Defect:** SEC-08: Permissive CORS Configuration
- **Files Modified:** `backend/src/main/java/com/internflow/config/SecurityConfig.java`
- **Changes Applied:**
  - Removed wildcard `*` origin allowance.
  - Configured explicit origins bound to `${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}`.
- **Verification:** Verified CORS headers match configured origins.

---

### Record ID: REP-DATA-01
- **Vulnerability / Defect:** DATA-01: Company Profile ID vs User ID Discrepancy
- **Files Modified:** `backend/src/main/java/com/internflow/modules/application/ApplicationService.java`
- **Changes Applied:**
  - In `getCompanyApplications`, resolved company record using `companyRepository.findByUserId(userId)` before querying `applicationRepository.findByCompanyId`.
- **Verification:** Company dashboard displays incoming student applications without returning empty lists.

---

### Record ID: REP-ELIG-01
- **Vulnerability / Defect:** ELIG-01: Unverified Academic Record Modification & Bypass
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/student/StudentService.java`
  - `backend/src/main/java/com/internflow/modules/eligibility/EligibilityEngineService.java`
- **Changes Applied:**
  - In `StudentService.updateMyProfile`, compared original academic fields (`cgpa`, `department`, `rollNumber`, `activeBacklogs`) with update request. If changed, reset `isVerified` to `false` and registered an audit log entry.
  - In `EligibilityEngineService`, checked `student.getIsVerified()`. If false, set eligibility to `false`, status to `AWAITING_VERIFICATION`, and logged the requirement.
- **Verification:** Eligibility tests confirm students with unverified records cannot qualify for drives.

---

### Record ID: REP-API-01
- **Vulnerability / Defect:** API-01: Duplicate `/api/api` Route Invocation
- **Files Modified:**
  - `frontend/src/api/client.ts`
  - `frontend/src/api/services.ts`
  - 14 frontend component TSX files across admin, company, and student pages.
- **Changes Applied:**
  - In `client.ts`, implemented an Axios request interceptor that removes any leading `/api/` from the request URL.
  - Cleaned all hardcoded `/api/` paths across all page call sites (`MatchModal.tsx`, `AdminDashboard.tsx`, `AuditLogs.tsx`, `CompanyApprovals.tsx`, `DocumentVerifications.tsx`, `InternshipApprovals.tsx`, `SkillManager.tsx`, `ApplicantsPipeline.tsx`, `CompanyDashboard.tsx`, `CompanyInterviews.tsx`, `CompanyProfile.tsx`, `PostInternship.tsx`, `StudentDocuments.tsx`, `StudentInterviews.tsx`).
- **Verification:** Full frontend test suite (7/7 tests) and TypeScript production build (`tsc && vite build`) passed with zero errors.

---

### Record ID: REP-API-02 & API-04
- **Vulnerability / Defect:** API-02 & API-04: Placement Drive and Interview Parameter Contracts
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/drive/PlacementDriveController.java`
  - `backend/src/main/java/com/internflow/modules/drive/dto/CreatePlacementDriveRequest.java`
  - `backend/src/main/java/com/internflow/modules/drive/dto/PlacementDriveDTO.java`
  - `backend/src/main/java/com/internflow/modules/interview/InterviewController.java`
  - `backend/src/main/java/com/internflow/modules/interview/InterviewService.java`
  - `backend/src/main/java/com/internflow/modules/interview/dto/InterviewFeedbackRequest.java`
  - `frontend/src/pages/company/CompanyInterviews.tsx`
- **Changes Applied:**
  - Added flexibility to accept both `@RequestBody` and `@RequestParam` for status updates in `PlacementDriveController`.
  - Added parameter aliases (`name`/`driveName`, `batchYear`, `maxBacklogs`) in `CreatePlacementDriveRequest` and getters in `PlacementDriveDTO`.
  - Added `outcome` alias and defaulted status to `COMPLETED` in `InterviewFeedbackRequest`.
  - Granted TPO and Admin permissions for interview rescheduling and feedback.
- **Verification:** Frontend interview and placement drive pages compile and interact cleanly.

---

### Record ID: REP-DEP-01 & DEP-02
- **Vulnerability / Defect:** DEP-01 & DEP-02: Container Build Failures and Missing CI Pipeline
- **Files Modified:**
  - `docker/backend.Dockerfile`
  - `docker/frontend.Dockerfile`
  - `frontend/nginx.conf`
  - `.github/workflows/ci.yml`
- **Changes Applied:**
  - Updated `backend.Dockerfile` to use `maven:3.9-eclipse-temurin-21` for reliable builds without requiring `mvnw`.
  - Co-located `nginx.conf` inside `frontend/` and updated `frontend.Dockerfile` context.
  - Created `.github/workflows/ci.yml` executing automated PostgreSQL 16 service container tests, Maven packaging, Vitest runner, and Vite production bundle on pull requests and pushes to master.
- **Verification:** Production bundle succeeds with `vite build`.
