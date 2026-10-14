# InternFlow — Product Requirements Document (PRD)

## 1. Executive Summary & Vision
InternFlow is an enterprise-grade Internship and Placement Management Platform designed for higher education institutions, university placement cells, and corporate recruiting partners. It centralizes student profiling, company onboarding, opportunity publication, deterministic eligibility verification, placement drives, multi-round interview pipelines, official offer tracking, and analytics.

## 2. Core Stakeholders & Roles
1. **STUDENT**: Enrolled candidates seeking internships and placement opportunities. Manages profile, academic backlogs, resumes, reviews deterministic eligibility, applies to opportunities, tracks interview rounds, and accepts/declines offers.
2. **TPO (Training & Placement Officer)**: Institutional placement cell leadership. Sets institutional rules, verifies student profiles, creates and schedules placement drives, reviews company opportunities, supervises interview pipelines, views batch analytics, and exports reports.
3. **RECRUITER / COMPANY**: Corporate talent acquisition partner. Manages company profile, posts internship/job openings, reviews applications, shortlists candidates, schedules interview rounds with meeting links, and issues formal offers.
4. **FACULTY_COORDINATOR**: Department-level academic coordinator. Verifies student credentials, monitors department-specific placement percentage, and endorses candidate eligibility.
5. **ADMIN**: Platform system administrator. Manages user accounts, institutional settings, canonical skill dictionaries, audit logs, and system health.

## 3. Functional Requirements
### FR-1: Student Profile & Document Management
- Store student academic records: Roll number, Department/Branch, CGPA, active and historical backlogs, graduation year.
- Skills repository linked to canonical skill dictionary.
- Secure resume upload (PDF format, media type verification, max 10MB, isolated private storage).
- Verification status tracked by TPO/Faculty Coordinator (`UNVERIFIED`, `VERIFIED`, `REJECTED`).

### FR-2: Company & Recruiter Relationship Management
- Company profile, industry, website, headquarters, recruiter details.
- Multi-stage company verification (`PENDING`, `APPROVED`, `REJECTED`) by TPO/Admin.

### FR-3: Opportunity & Placement Drive Management
- Internships & Full-time opportunities with stipend/salary, openings, duration, deadlines, allowed branches, minimum CGPA, backlog thresholds.
- Workflow: `DRAFT` -> `SUBMITTED_FOR_APPROVAL` -> `APPROVED` / `PUBLISHED` -> `CLOSED`.
- Placement Drives: Campus recruitment drives coordinating multiple companies/roles, physical/virtual venues, deadlines, and batch schedules.

### FR-4: Deterministic Eligibility Engine
- Rule-based evaluation checking:
  1. Academic Branch matching (case-insensitive list containment).
  2. Minimum CGPA threshold.
  3. Maximum active backlogs permitted.
  4. Graduation year eligibility.
  5. Profile verification requirement.
- Server-side re-validation during application submission to prevent tampered payloads.
- Clear explainability providing human-readable reasons for non-eligibility.

### FR-5: Application Pipeline & State Machine
- Unique constraint preventing duplicate applications per student per opportunity.
- Strict state machine transitions:
  - `APPLIED` -> `UNDER_REVIEW` -> `SHORTLISTED` -> `INTERVIEW_SCHEDULED` -> `OFFERED` -> `ACCEPTED` / `REJECTED` / `WITHDRAWN`.
- Complete auditable transition history recording actor, timestamp, previous status, and notes.

### FR-6: Multi-Round Interview Management
- Round sequence, mode (`ONLINE`, `IN_PERSON`, `PHONE`), date/time, meeting link, interviewer feedback, and candidate rating (1-5).
- Notifications sent on interview scheduling and status updates.

### FR-7: Offer Management & Joining Confirmation
- Offer details: CTC / Stipend, designation, issue date, joining date, acceptance deadline.
- Student actions: Accept or Decline offer with feedback notes.
- College policy enforcement regarding multi-offer acceptance.

### FR-8: Dashboards & Reporting Analytics
- Real-time aggregation of placement metrics directly from database queries.
- Placement rate by department, salary distributions, company participation, conversion funnel.
- Authorized CSV export for placement compliance and accreditation (e.g., NAAC / NBA).

## 4. Non-Functional Requirements
- **Security**: JWT authentication, BCrypt password hashing, role-based method security, strict object-level authorization, CORS protection, SQL injection prevention via JPA parameterized queries.
- **Persistence**: PostgreSQL relational database with Flyway versioned migrations.
- **Performance**: Sub-100ms response times for core API endpoints; indexed foreign keys and lookup queries.
- **Reliability & Auditability**: Comprehensive audit trail for critical status changes and verification actions.
