# InternFlow REST API Reference

All requests must supply the JWT bearer token in the `Authorization` header, except for public endpoints:
```http
Authorization: Bearer <JWT_TOKEN>
```

All standard JSON responses adhere to the uniform envelope:
```json
{
  "success": true,
  "message": "Optional human-readable confirmation",
  "data": { ... },
  "timestamp": "2026-09-07T12:00:00Z"
}
```

---

## 1. Authentication & Session (`/api/auth`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticate user and issue signed JWT bearer token |
| `POST` | `/api/auth/register/student` | Public | `{ email, password, firstName, lastName, college, degree, branch, graduationYear, cgpa }` | Register student user and initialize profile |
| `POST` | `/api/auth/register/company` | Public | `{ email, password, companyName, website, industry, location, description }` | Register corporate recruiter (creates pending KYC profile) |
| `GET` | `/api/auth/me` | Authenticated | None | Retrieve authenticated user context and profile ID |

---

## 2. Student Profiles & Matching (`/api/students`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/students/me` | `STUDENT` | None | Get full student profile with skills, projects, and experiences |
| `PUT` | `/api/students/me` | `STUDENT` | `{ firstName, lastName, phone, college, degree, branch, graduationYear, cgpa, bio }` | Update primary academic & biographical information |
| `POST` | `/api/students/me/skills` | `STUDENT` | `{ skillName, proficiencyLevel, yearsExperience }` | Add canonicalized skill to profile |
| `DELETE`| `/api/students/me/skills/{id}` | `STUDENT` | None | Remove a skill entry from profile |
| `POST` | `/api/students/me/projects` | `STUDENT` | `{ title, description, techStack, githubUrl, liveUrl }` | Add portfolio project |
| `POST` | `/api/students/me/experiences` | `STUDENT` | `{ organizationName, role, startDate, endDate, current, description }` | Add work/internship experience |
| `POST` | `/api/students/me/certifications` | `STUDENT` | `{ name, issuingOrg, issueDate, credentialUrl }` | Add professional certification |
| `GET` | `/api/students/me/matches/{internshipId}` | `STUDENT` | None | Get 5-factor explainable match breakdown for an internship |
| `GET` | `/api/students/me/skill-gap/{internshipId}` | `STUDENT` | None | Get skill gap analysis and recommended study topics |
| `GET` | `/api/students/{studentId}/matches/{internshipId}` | `COMPANY`, `ADMIN` | None | Candidate match scorecard for recruiters |

---

## 3. Company & KYC Administration (`/api/company`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/company/profile` | `COMPANY` | None | Get recruiter's company profile and KYC verification status |
| `PUT` | `/api/company/profile` | `COMPANY` | `{ companyName, website, industry, location, description, logoUrl }` | Update company branding and details |
| `GET` | `/api/company/{id}` | Public | None | View public company profile details |
| `GET` | `/api/company/admin/pending` | `ADMIN` | None | Get paginated list of companies awaiting KYC review |
| `GET` | `/api/company/admin/all` | `ADMIN` | None | Get all registered employers across platform |
| `POST` | `/api/company/admin/{id}/verify` | `ADMIN` | `{ status, notes }` | Approve (`APPROVED`), Reject (`REJECTED`), or Suspend (`SUSPENDED`) |

---

## 4. Internship Postings (`/api/internships`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/internships/public` | Public | Query params: `keyword, workMode, minStipend, page, size` | Search and filter published internships with pagination |
| `GET` | `/api/internships/public/{id}` | Public | None | Get single published internship details |
| `POST` | `/api/internships/company` | `COMPANY` | `{ title, description, location, workMode, durationMonths, stipendPerMonth, minCgpa, allowedBranches, graduationYear, applicationDeadline, openings, requiredSkills, preferredSkills }` | Post new internship (queued for admin approval) |
| `GET` | `/api/internships/company` | `COMPANY` | Query params: `page, size` | Get all postings created by current company |
| `PATCH`| `/api/internships/company/{id}/close` | `COMPANY` | None | Mark an active posting as `CLOSED` |
| `GET` | `/api/internships/admin/pending` | `ADMIN` | Query params: `page, size` | List postings awaiting placement cell approval |
| `POST` | `/api/internships/admin/{id}/approve` | `ADMIN` | `{ approved, rejectionReason }` | Approve & publish or reject posting |

---

## 5. Application State Machine (`/api/applications`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/applications/internships/{id}/apply` | `STUDENT` | `{ coverNote }` | Submit application (validates duplicates & eligibility) |
| `GET` | `/api/applications/student/me` | `STUDENT` | Query params: `page, size` | Get student's application history and current statuses |
| `POST` | `/api/applications/{id}/withdraw` | `STUDENT` | None | Withdraw active application (early stages only) |
| `GET` | `/api/applications/company` | `COMPANY` | Query params: `page, size` | List all applicants across company postings |
| `PATCH`| `/api/applications/{id}/status` | `COMPANY`, `ADMIN` | `{ targetStatus, notes }` | Advance application status via strict state machine |
| `GET` | `/api/applications/admin/all` | `ADMIN` | Query params: `status, page, size` | Institutional application monitoring |

---

## 6. Interview Rounds & Scorecards (`/api/interviews`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/interviews/schedule` | `COMPANY`, `ADMIN` | `{ applicationId, scheduledAt, meetingLink, mode }` | Schedule technical/HR interview round |
| `PATCH`| `/api/interviews/{id}/reschedule` | `COMPANY`, `ADMIN` | `{ newScheduledAt, meetingLink }` | Reschedule upcoming interview |
| `POST` | `/api/interviews/{id}/feedback` | `COMPANY`, `ADMIN` | `{ feedback, rating, outcome }` | Submit candidate scorecard & complete round |
| `GET` | `/api/interviews/student/me` | `STUDENT` | None | View scheduled interviews for logged-in student |
| `GET` | `/api/interviews/company` | `COMPANY` | Query params: `page, size` | View all interviews scheduled by recruiter |

---

## 7. Document KYC & Storage (`/api/documents`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | `STUDENT` | `MultipartFile file, documentType, applicationId` | Securely upload offer letters, reports, or certificates |
| `GET` | `/api/documents/{id}/download` | Authenticated | None | Stream authorized document (validates user ownership) |
| `GET` | `/api/documents/student/me` | `STUDENT` | None | List student's uploaded documents & verification states |
| `GET` | `/api/documents/admin/pending` | `ADMIN` | Query params: `page, size` | Documents queue awaiting administrator authentication |
| `POST` | `/api/documents/admin/{id}/verify` | `ADMIN` | `{ status, rejectionReason }` | Verify and approve or decline student document |

---

## 8. Analytics & Audit Logging (`/api/analytics`, `/api/admin/audit-logs`)

| Method | Endpoint | Authorized Roles | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/admin` | `ADMIN` | None | Live aggregated institutional placement metrics |
| `GET` | `/api/analytics/company` | `COMPANY` | None | Company hiring funnel, conversion rates, and status counts |
| `GET` | `/api/analytics/student` | `STUDENT` | None | Application progress, completion percentage, interview count |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Query params: `page, size` | Immutable security audit trail of sensitive mutations |
