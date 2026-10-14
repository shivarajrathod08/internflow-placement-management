# InternFlow Security & Compliance Architecture

InternFlow incorporates defensive security controls designed to comply with institutional educational data protection standards (FERPA compliance considerations) and industrial SaaS security baselines.

---

## 1. Authentication & Session Management

- **Stateless JWT Tokens**:
  - Signed with HMAC-SHA256 using a high-entropy 256-bit secret key.
  - Token payload carries `userId`, `email`, and `role`.
  - Expiration defaults to 24 hours. Expired tokens are rejected before reaching business services.
- **Cryptographic Password Hashing**:
  - Passwords are salted and hashed using **BCrypt** with an adaptive work factor (`strength = 12`).
  - Passwords are never stored or logged in plain text.
- **Stateless Authorization Filter**:
  - `JwtAuthenticationFilter` intercepts incoming HTTP requests, validates the cryptographic signature, extracts the user claims, and establishes the Spring Security `SecurityContext`.

---

## 2. Role-Based Access Control (RBAC)

Method-level authorization is strictly enforced across all controller endpoints via `@PreAuthorize`:

| Resource Domain | STUDENT | COMPANY | ADMIN |
| :--- | :---: | :---: | :---: |
| Browse Published Internships | ✅ | ✅ | ✅ |
| View 5-Factor Match Breakdown | ✅ (Self) | ✅ (Applicants) | ✅ |
| Submit Application | ✅ | ❌ | ❌ |
| Withdraw Application | ✅ (Early only) | ❌ | ❌ |
| Post Internships | ❌ | ✅ (Verified only) | ✅ |
| Advance Candidate Status | ❌ | ✅ (Own postings) | ✅ |
| Schedule Interviews | ❌ | ✅ | ✅ |
| Submit Candidate Scorecards | ❌ | ✅ | ✅ |
| Upload KYC Documents | ✅ | ❌ | ❌ |
| Verify Documents (KYC) | ❌ | ❌ | ✅ |
| Approve / Reject Postings | ❌ | ❌ | ✅ |
| Verify / Suspend Companies | ❌ | ❌ | ✅ |
| View Security Audit Logs | ❌ | ❌ | ✅ |

---

## 3. Secure File Upload & Storage Defense

File uploads present significant attack surfaces (malicious executables, path traversal, XXE, SSRF). InternFlow implements layered controls:

1. **MIME Whitelist Validation**:
   - Only approved document MIME types are permitted:
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `image/png`, `image/jpeg`
   - Content-Type headers are validated against actual file extensions.
2. **File Size Hard Limits**:
   - Resumes & Documents capped at **10 MB** in Spring Boot and NGINX configs.
3. **Path Traversal Mitigation**:
   - Uploaded files are renamed using deterministic sanitized paths and UUIDs. User-supplied filenames are never used directly as filesystem paths (`normalizePath()` sanitization).
4. **Access-Controlled Streaming Downloads**:
   - Documents are stored outside the public web server root.
   - The `/api/documents/{id}/download` endpoint verifies whether the requesting user is the student owner, the hiring recruiter, or a placement administrator before streaming the file.

---

## 4. Immutable Audit Trail

Every sensitive platform operation triggers an asynchronous, immutable audit log entry in `audit_logs`:
- User authentication & failed login attempts
- Company KYC verification status changes (`APPROVED`, `REJECTED`, `SUSPENDED`)
- Internship approval decisions
- Candidate state machine status advancements (`SHORTLISTED`, `SELECTED`, etc.)
- Student document verification decisions
- Canonical skill taxonomy modifications

Audit log records record the actor ID, actor email, role, action, target entity name & ID, previous state, new state, IP address, and UTC timestamp. The audit table has no `DELETE` or `UPDATE` endpoints exposed.

---

## 5. OWASP Top 10 Mitigation Matrix

| Vulnerability | InternFlow Defense Strategy |
| :--- | :--- |
| **A01: Broken Access Control** | Method-level `@PreAuthorize` on every controller + ownership verification checks in domain services. |
| **A02: Cryptographic Failures** | BCrypt work factor 12, HMAC-SHA256 JWTs, TLS/HTTPS termination via NGINX. |
| **A03: Injection (SQL/NoSQL)** | 100% Parameterized queries via Spring Data JPA & Hibernate. Zero raw string concatenation. |
| **A04: Insecure Design** | Strict state machine transitions prevent bypassing required interview and screening gates. |
| **A05: Security Misconfiguration** | Custom `GlobalExceptionHandler` ensures stack traces and internal class names are never leaked in API responses. |
| **A06: Vulnerable Components** | Fully patched modern dependencies (Spring Boot 3.3.4, JJWT 0.12.6, React 18). |
| **A07: Identification & Auth Failures**| Strong password rules, brute-force awareness, stateless JWT invalidation upon logout. |
| **A08: Software & Data Integrity** | Flyway versioned migrations ensure reproducible, validated relational schema evolution. |
| **A09: Security Logging & Monitoring** | Comprehensive SLF4J structured logging + immutable `audit_logs` table. |
| **A10: Server-Side Request Forgery** | External meeting links and URLs are validated and rendered as client redirects, never fetched by the backend server. |
