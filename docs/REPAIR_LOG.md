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

---

### Record ID: REP-DEF-01
- **Vulnerability / Defect:** DEF-01: Recruiter Applicant Pipeline State Machine Block
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/application/ApplicationStateMachine.java`
  - `backend/src/test/java/com/internflow/modules/application/ApplicationStateMachineTest.java`
- **Changes Applied:**
  - In `ApplicationStateMachine.java`, permitted direct recruiter shortlisting (`SHORTLISTED`) and direct rejection (`REJECTED`) from initial `APPLIED` state.
  - Permitted `INTERVIEW_SCHEDULED` from `UNDER_REVIEW`, and `SELECTED`/`OFFERED` from `SHORTLISTED`.
  - Added unit test cases in `ApplicationStateMachineTest.java` verifying allowed transitions and preventing regression on illegal transitions.
- **Verification:** `ApplicationStateMachineTest` passed with 5 test cases.

---

### Record ID: REP-DEF-02
- **Vulnerability / Defect:** DEF-02: Interview Schedule Routing Path Mismatch
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/interview/InterviewController.java`
- **Changes Applied:**
  - Configured `@PostMapping({"", "/schedule"})` on `InterviewController.scheduleInterview` to support both `/api/interviews` and `/api/interviews/schedule` invoked from `ApplicantsPipeline.tsx`.
  - Added symmetric authorization for `COMPANY`, `RECRUITER`, `ADMIN`, `TPO` across scheduling, rescheduling, and feedback endpoints.
- **Verification:** Endpoint matches frontend Axios requests; build and tests passing.

---

### Record ID: REP-DEF-03
- **Vulnerability / Defect:** DEF-03: Company KYC Rejection DTO Discrepancy
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/company/VerifyCompanyRequest.java`
  - `frontend/src/pages/admin/CompanyApprovals.tsx`
- **Changes Applied:**
  - Added `notes` field in `VerifyCompanyRequest.java` and provided fallback getters so both `rejectionReason` and `notes` are supported.
  - Updated `CompanyApprovals.tsx` to provide both `rejectionReason` and `notes` payloads.
- **Verification:** Approvals and rejections persist rejection notes cleanly into audit trail and notifications.

---

### Record ID: REP-DEF-04
- **Vulnerability / Defect:** DEF-04: Cross-Company Offer BOLA/IDOR Data Leak
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/offer/OfferController.java`
  - `backend/src/main/java/com/internflow/modules/offer/OfferService.java`
  - `backend/src/test/java/com/internflow/modules/offer/OfferIntegrationTest.java`
- **Changes Applied:**
  - Added overloaded `getOffersByCompanyEntityId(Long companyId, Long userId, Role role)` in `OfferService.java`.
  - Checked that if caller has role `COMPANY` or `RECRUITER`, caller's owned company ID must match `companyId`. Mismatch throws `ForbiddenException`.
  - Added integration test in `OfferIntegrationTest.java` asserting HTTP 403 / Forbidden on unauthorized cross-company offer inspection.
- **Verification:** `OfferIntegrationTest` passed with 4/4 passing tests.

---

### Record ID: REP-DEF-05
- **Vulnerability / Defect:** DEF-05: Asymmetric Recruiter Role Recognition
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/offer/OfferService.java`
  - `backend/src/main/java/com/internflow/modules/document/DocumentService.java`
  - `backend/src/main/java/com/internflow/modules/student/StudentController.java`
  - `backend/src/main/java/com/internflow/security/SecurityUtils.java`
  - `backend/src/main/java/com/internflow/modules/auth/AuthService.java`
- **Changes Applied:**
  - Added `Role.RECRUITER` checks in all locations checking `Role.COMPANY`.
  - Ensured `SecurityUtils.isCompany()` returns true for recruiters.
  - Fixed `AuthService` user DTO mapping to resolve recruiter profile IDs correctly.
- **Verification:** Recruiter users can access company portal, download applicant resumes, and issue job offers.

---

### Record ID: REP-DEF-06
- **Vulnerability / Defect:** DEF-06: Institutional TPO Role Blockage
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/company/CompanyController.java`
  - `backend/src/main/java/com/internflow/modules/document/DocumentController.java`
  - `backend/src/main/java/com/internflow/modules/skill/SkillController.java`
  - `backend/src/main/java/com/internflow/modules/audit/AuditLogController.java`
  - `backend/src/main/java/com/internflow/modules/application/ApplicationService.java`
  - `backend/src/main/java/com/internflow/modules/internship/InternshipService.java`
- **Changes Applied:**
  - Extended `@PreAuthorize` from `hasRole('ADMIN')` to `hasAnyRole('ADMIN', 'TPO')` across institutional management endpoints.
- **Verification:** Training & Placement Officers can manage KYC approvals, document verifications, skills, and drive lifecycles.

---

### Record ID: REP-DEF-07
- **Vulnerability / Defect:** DEF-07: Placement Drive Academic Verification Bypass & Candidate Pool Exposure
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/placementdrive/PlacementDriveController.java`
  - `backend/src/main/java/com/internflow/modules/placementdrive/PlacementDriveService.java`
  - `backend/src/test/java/com/internflow/modules/placementdrive/PlacementDriveIntegrationTest.java`
- **Changes Applied:**
  - In `PlacementDriveService.getEligibleCandidates`, strictly verified `Boolean.TRUE.equals(student.getIsVerified())`.
  - Added ownership check ensuring recruiters cannot query candidate pools of competitor campus drives.
  - Added unit/integration test in `PlacementDriveIntegrationTest.java`.
- **Verification:** `PlacementDriveIntegrationTest` passed with 3/3 passing tests.

---

### Record ID: REP-DEF-08
- **Vulnerability / Defect:** DEF-08: Seed Demo Credential Production Posture
- **Files Modified:**
  - `backend/src/main/java/com/internflow/config/ProductionSecuritySanitizer.java`
- **Changes Applied:**
  - Created `ProductionSecuritySanitizer.java` activated under Spring profile `prod`.
  - Queries and deactivates any seed accounts retaining default demo passwords (`Password@123`), neutralizing credential exploitation on live deployments without modifying historical Flyway migrations.
- **Verification:** Context builds and initializes cleanly under all environments.

---

### Record ID: REP-DOC-01
- **Vulnerability / Defect:** Student Resume Access HTTP 403 Forbidden Error
- **Root Cause:**
  1. The student resume link in `StudentProfile.tsx` was implemented as a raw unauthenticated anchor tag `<a href={profile.resumeUrl} target="_blank">`.
  2. Clicking the link executed a native browser GET request to `/api/documents/{id}/download`.
  3. Plain browser tab navigations do not send the `Authorization: Bearer <token>` header stored in React client memory / `localStorage`.
  4. Spring Security intercepted the unauthenticated request to `/api/documents/**`, rejected it with HTTP 401/403, and the browser displayed `HTTP ERROR 403 — Access to localhost was denied`.
  5. In addition, seed data in `V3__seed_demo_platform_data.sql` stored legacy unmapped paths (`/uploads/resumes/alex_rivera_resume.pdf`) and the physical files were missing from disk storage.
- **Files Modified:**
  - `backend/src/main/java/com/internflow/security/JwtAuthenticationFilter.java`
  - `backend/src/main/java/com/internflow/modules/document/DocumentController.java`
  - `backend/src/main/java/com/internflow/modules/document/DocumentService.java`
  - `backend/src/main/resources/db/migration/V5__fix_document_paths_and_resume_urls.sql`
  - `frontend/src/utils/documentViewer.ts` (created)
  - `frontend/src/components/common/DocumentPreviewModal.tsx` (created)
  - `frontend/src/pages/student/StudentProfile.tsx`
  - `frontend/src/pages/student/StudentDocuments.tsx`
  - `backend/src/test/java/com/internflow/modules/document/DocumentServiceTest.java` (created)
  - `backend/src/test/java/com/internflow/modules/document/DocumentControllerTest.java` (created)
  - `frontend/src/test/documentViewer.test.ts` (created)
  - `frontend/src/test/StudentProfileResume.test.tsx` (created)
- **Changes Applied:**
  - Created centralized authenticated document helper `documentViewer.ts` fetching documents via Axios with `responseType: 'blob'`, injecting Bearer token, extracting headers, creating temporary Object URLs, and revoking them safely.
  - Implemented `DocumentPreviewModal.tsx` with Campus Ledger editorial styling (`#FFFCF7` card, `#192844` heading, `#E5DED2` border), offering inline PDF viewing, new tab option, and download action.
  - Upgraded `StudentProfile.tsx` (Tab 6: Resume Document) with separate "View / Preview" and "Download" buttons, loading spinners, and Campus Ledger error alerts.
  - Hardened backend `DocumentService.java` with path traversal prevention (`..` rejection), multi-strategy physical file resolution, seed demo PDF materialization for missing test documents, and clean JSON 404 responses.
  - Added query parameter `?token=` fallback support in `JwtAuthenticationFilter` for `/api/documents/**`.
  - Added `V5__fix_document_paths_and_resume_urls.sql` migration normalizing student `resume_url` records to `/api/documents/{id}/download`.
- **Verification:**
  - `DocumentServiceTest` passed with 7/7 tests.
  - `DocumentControllerTest` passed with 8/8 tests.
  - `documentViewer.test.ts` passed with 14/14 tests.
  - `StudentProfileResume.test.tsx` passed with 4/4 tests.

---

### Record ID: REP-DOC-02
- **Vulnerability / Defect:** Recruiter Candidate Resume 404 - Page Not Found Navigation Error
- **Root Cause:**
  1. In `ApplicantsPipeline.tsx`, the candidate resume shortcut was rendered as `<a href={app.studentResumeUrl} target="_blank">`.
  2. In the seeded database, `app.studentResumeUrl` was `/uploads/resumes/alex_rivera_resume.pdf`.
  3. Clicking the link triggered client-side browser navigation to `http://localhost:5173/uploads/resumes/alex_rivera_resume.pdf`.
  4. React Router had no route registered for `/uploads/**`, so it matched the fallback `<Route path="*" element={<NotFound />} />` and displayed the InternFlow `404 - Page Not Found` component.
  5. If the candidate had no uploaded resume (`studentResumeUrl` null or missing), the button was either hidden or caused confusion, with no clear messaging provided to the recruiter.
- **Files Modified:**
  - `backend/src/main/java/com/internflow/modules/application/ApplicationDTO.java`
  - `backend/src/main/java/com/internflow/modules/application/ApplicationController.java`
  - `backend/src/main/java/com/internflow/modules/application/ApplicationService.java`
  - `backend/src/main/java/com/internflow/security/JwtAuthenticationFilter.java`
  - `frontend/src/pages/company/ApplicantsPipeline.tsx`
  - `backend/src/test/java/com/internflow/modules/application/ApplicationResumeTest.java` (created)
  - `frontend/src/test/ApplicantsPipelineResume.test.tsx` (created)
- **Changes Applied:**
  - Implemented application-level resume endpoint `GET /api/applications/{id}/resume` in `ApplicationController.java` and `ApplicationService.java`.
  - Enforced strict object-level authorization: recruiters can only view resumes for candidates who applied to an opportunity owned by their company; student callers can only access their own applications; institutional staff (Admin/TPO) retain platform access. Unauthorized cross-company attempts return HTTP 403 Forbidden.
  - Normalized `ApplicationDTO.studentResumeUrl` to `/api/applications/{id}/resume` when candidate has a resume; remains null if candidate has no resume.
  - Candidates with no resume return a clean HTTP 404 with JSON message `"Candidate <name> has not uploaded a resume document yet."`.
  - In `ApplicantsPipeline.tsx`:
    - Replaced raw `<a href>` with an authenticated button integrating `DocumentPreviewModal`.
    - Added loading spinner on the candidate row while the resume stream is fetched.
    - Candidates without resumes have an explicit status and clicking shows a friendly notice: `"Candidate <name> has not uploaded a resume document yet."`.
    - Preserved candidate pipeline table, search, filters, and state without any navigation to 404.
    - Added resume preview access inside the application lifecycle and history modal.
- **Verification:**
  - `ApplicationResumeTest` passed with 8/8 tests.
  - `ApplicantsPipelineResume.test.tsx` passed with 4/4 tests.
  - Full backend test suite passed with 45/45 tests.
  - Full frontend test suite passed with 67/67 tests (13 test files).
  - Production frontend build `npm run build` succeeded cleanly in 9.61s.
