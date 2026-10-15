# InternFlow — Application Security Architecture Review

## 1. Security Architecture Overview

InternFlow is engineered according to the principle of **Defense-in-Depth**, prioritizing student data privacy, institutional integrity, and strict separation between tenant roles.

```
[ Browser / Client ]
        │  HTTPS / TLS 1.3
        ▼
[ NGINX Reverse Proxy ] ─── (CORS Filter / Upload Limit: 20MB)
        │
        ▼
[ Spring Security 6 Filter Chain ]
        ├── JwtAuthenticationFilter (RFC 7519 HMAC-SHA256 validation)
        ├── UsernamePasswordAuthenticationToken injection
        └── SecurityContextHolder
                 │
                 ▼
[ Method-Level Authorization (@PreAuthorize / Custom Evaluators) ]
        ├── Role-Based Access Control (RBAC): ADMIN, TPO, FACULTY_COORDINATOR, COMPANY_RECRUITER, STUDENT
        └── Object-Level Access Control (ABAC/IDOR Prevention):
                 ├── Student Owns Profile / Documents
                 ├── Company Owns Internships / Offers
                 └── Recruiter Only Inspects Applicants to Their Own Roles
```

---

## 2. Authentication & Cryptography

### 2.1 JWT Token Security (SEC-02)
- **Token Format:** Signed JSON Web Token (JWS) utilizing `HMAC-SHA256`.
- **Secret Externalization:** The JWT signing secret is bound to the environment via `app.jwt.secret: ${JWT_SECRET}`.
- **Runtime Entropy Verification:** On application context bootstrap, `JwtTokenProvider` inspects the configured secret key. If the key is null, whitespace, or contains less than 256 bits (32 bytes) of cryptographic entropy, the constructor immediately rejects initialization with an `IllegalStateException`, halting server startup before any insecure credentials can be minted.
- **Stateless Verification:** Every incoming HTTP request parses the `Authorization: Bearer <token>` header, extracts claims, validates the token expiration timestamp, and verifies the HMAC signature.

### 2.2 Password Storage & Hashing
- User passwords are encrypted using `BCryptPasswordEncoder` with standard cost factor 10.
- Raw passwords are never stored, logged, or returned in any DTO or API response.

---

## 3. Authorization & IDOR/BOLA Protection

### 3.1 Document Storage & Isolated Streaming (SEC-03, FILE-01)
- **Vulnerability Identified:** The previous configuration exposed student resumes and marksheets via unauthenticated static handlers under `/uploads/**`.
- **Remediation Implemented:**
  1. The static resource handler in `WebConfig.java` was eradicated.
  2. The `/uploads/**` whitelist in `SecurityConfig.java` was revoked.
  3. All document retrieval was channeled through `GET /api/documents/{id}/download` under `@PreAuthorize("isAuthenticated()")`.
  4. In `DocumentService.java`, strict object-level access verification enforces that:
     - The downloading user is the author/owner of the document (`student.getUserId().equals(currentUserId)`), **OR**
     - The downloading user is a college staff member (`ROLE_TPO`, `ROLE_ADMIN`, `ROLE_FACULTY_COORDINATOR`), **OR**
     - The downloading user is an authorized company recruiter whose company has received an active job application associated with this document.

### 3.2 Student Profile Scoping (SEC-04)
- General student roster enumeration (`GET /api/students`) is strictly confined to college placement staff (`hasAnyRole('TPO', 'FACULTY_COORDINATOR', 'ADMIN')`).
- Detailed individual student profiles (`GET /api/students/{id}`) and match algorithms (`GET /api/students/{id}/match/{internshipId}`) require either administrative privilege or active applicant ownership by the querying recruiter's company.

### 3.3 Placement Offer Authorization & State Machine (SEC-05, SEC-06)
- **Offer Issuance:** Recruiter credentials are cross-referenced with `companyRepository.findByUserId(currentUser.getId())`. Recruiters cannot generate offers under foreign company identifiers.
- **State Machine Integrity:** Offer status transitions are strictly governed:
  - Students can transition an offer from `OFFERED` to `ACCEPTED` or `REJECTED`.
  - Companies can transition accepted offers to `JOINED` or revoke offers to `REVOKED`.
  - Illegal status transitions throw a `ValidationException` (HTTP 400).

### 3.4 Competitor Offer Data Isolation / BOLA Defense (DEF-04)
- **Vulnerability Remediated:** Previously, `GET /api/offers/company/{companyId}` permitted any authenticated recruiter to query salary details, CTC figures, and candidate offers belonging to competitor organizations simply by changing the `companyId` path parameter.
- **Remediation Enforced:**
  - In `OfferService.java`, the querying user's linked company ID is resolved via `companyRepository.findByUserId(userId)`.
  - If the caller possesses role `COMPANY` or `RECRUITER`, the service verifies that `company.getId().equals(companyId)`. Any cross-company query immediately raises a `ForbiddenException` (HTTP 403).
  - Only campus administrative officers (`ROLE_ADMIN`, `ROLE_TPO`) are permitted cross-company offer aggregation across the institution.

### 3.5 Drive Candidate Pool Privacy & Verification Enforcement (DEF-07)
- In `PlacementDriveService.getEligibleCandidates`, company-specific drives are restricted: recruiters from Company A cannot query eligible candidate rosters for drives sponsored by Company B.
- Unverified student accounts (`isVerified != true`) are strictly filtered out from eligible drive rosters to eliminate fraudulent candidate selections.

---

## 4. Academic Record Integrity & Eligibility Defense (ELIG-01)

- In academic recruitment, tampered CGPA, falsified backlogs, or altered departments represent a severe fraud risk.
- In `StudentService.java`, any modification to `cgpa`, `department`, `rollNumber`, or `activeBacklogs` triggers an automated reset of `studentProfile.setIsVerified(false)`.
- An audit entry is persisted recording the exact unverified alteration.
- The `EligibilityEngineService.java` explicitly checks `student.getIsVerified()`. Any student with unverified academic credentials is automatically placed in status `AWAITING_VERIFICATION` with a non-passing eligibility flag, preventing unapproved participation in placement drives.

---

## 5. Network & Transport Security

### 5.1 Cross-Origin Resource Sharing (CORS - SEC-08)
- Wildcard CORS (`allowedOrigins("*")`) has been completely removed.
- Allowed origins are read from `app.cors.allowed-origins`, defaulting to trusted institutional frontends (e.g., `http://localhost:5173`, `http://localhost:3000`).

### 5.2 Seeder & Environment Isolation (SEC-01 & DEF-08)
- Demo data generation in `DemoDataInitializer.java` is annotated with `@Profile("local")` and guarded by `@ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true")`.
- Production runs (`SPRING_PROFILES_ACTIVE=prod`) completely omit this bean from the Spring application context, ensuring zero risk of demo account injection or credential disclosure in production logs.
- Additionally, `ProductionSecuritySanitizer.java` runs on container boot in the `prod` profile, proactively querying and deactivating (`isActive = false`) any residual or unrotated default demonstration accounts seeded in historical migrations (`V3__seed_demo_platform_data.sql`), preventing default password exploitation (`Password@123`).

---

## 6. Audit Logging & Non-Repudiation

InternFlow features a dedicated `AuditService` that logs high-value security events into PostgreSQL table `audit_logs`:
- User registration and login attempts
- Profile academic attribute modifications
- Document verifications and rejections
- Placement offer issuances, acceptances, and revocations
- Drive creation and candidate shortlisting decisions

Each audit entry captures `userId`, `action`, `entityType`, `entityId`, `details`, IP address, and an immutable `createdAt` timestamp.
