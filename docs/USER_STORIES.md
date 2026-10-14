# InternFlow — User Stories & Acceptance Criteria

## Epic 1: Identity & Authentication
- **US-1.1: Multi-Role Sign In**
  - *As a* Student, TPO, Recruiter, Faculty Coordinator, or Admin,
  - *I want to* sign in with my institutional email and secure password,
  - *So that* I can access my role-authorized workspace.
  - **Acceptance Criteria**:
    - Valid credentials return a signed JWT token and user details.
    - Invalid credentials return a generic 401 Unauthorized without user enumeration.
    - Account lockout or inactive status blocks access.

- **US-1.2: Student Self-Registration**
  - *As a* Student,
  - *I want to* register with my roll number, branch, graduation year, and institutional email,
  - *So that* my profile is created for placement participation.

## Epic 2: Profile & Verification
- **US-2.1: Academic Profile & Backlogs**
  - *As a* Student,
  - *I want to* maintain my CGPA, active backlogs, skills, projects, and certifications,
  - *So that* opportunities can accurately evaluate my qualifications.
  - **Acceptance Criteria**:
    - CGPA must be validated between 0.00 and 10.00.
    - Active backlogs non-negative integer.

- **US-2.2: TPO / Faculty Verification**
  - *As a* TPO or Faculty Coordinator,
  - *I want to* inspect student transcripts and verify profiles,
  - *So that* unverified claims do not compromise recruitment trust.

- **US-2.3: Secure Resume Upload**
  - *As a* Student,
  - *I want to* upload my PDF resume,
  - *So that* recruiters can review my credentials securely.
  - **Acceptance Criteria**:
    - Only `application/pdf` MIME type accepted.
    - Max size 10MB.
    - Accessible only by authorized recruiters and placement staff.

## Epic 3: Opportunities & Eligibility
- **US-3.1: Configurable Criteria Definition**
  - *As a* Recruiter or TPO,
  - *I want to* define allowed branches, minimum CGPA, maximum backlogs, and graduation year for an opportunity,
  - *So that* only eligible candidates can apply.

- **US-3.2: Deterministic Eligibility Feedback**
  - *As a* Student,
  - *I want to* see immediate, transparent feedback on whether I am eligible for an opportunity and why,
  - *So that* I understand institutional and corporate requirements.
  - **Acceptance Criteria**:
    - System displays green "Eligible" or amber/red "Not Eligible" badge.
    - Human-readable reasons listed (e.g. "CGPA below 7.50 requirement").

## Epic 4: Placement Drives & Applications
- **US-4.1: Placement Drive Scheduling**
  - *As a* TPO,
  - *I want to* organize on-campus and virtual placement drives linking companies and roles,
  - *So that* students can register for coordinated hiring cycles.

- **US-4.2: Application Submission & Re-validation**
  - *As a* Student,
  - *I want to* submit an application before the deadline,
  - *So that* I am considered for the opportunity.
  - **Acceptance Criteria**:
    - Server verifies eligibility and deadline at the time of submission.
    - Duplicate applications are blocked by database constraints.

- **US-4.3: Status Pipeline Management**
  - *As a* Recruiter or TPO,
  - *I want to* progress candidate statuses (`APPLIED` -> `UNDER_REVIEW` -> `SHORTLISTED` -> `INTERVIEW_SCHEDULED` -> `OFFERED`),
  - *So that* the recruitment pipeline stays current and transparent.

## Epic 5: Interviews & Selection
- **US-5.1: Interview Scheduling**
  - *As a* Recruiter or TPO,
  - *I want to* schedule rounds (Technical, HR, Managerial) with timestamps and virtual links,
  - *So that* students receive instant in-app notifications.

- **US-5.2: Feedback & Scoring**
  - *As a* Recruiter,
  - *I want to* record interview scores and private interviewer notes,
  - *So that* hiring decisions are well-documented.

## Epic 6: Offers & Reporting
- **US-6.1: Formal Offer Recording**
  - *As a* Recruiter or TPO,
  - *I want to* issue an offer specifying CTC/stipend, designation, and joining date,
  - *So that* selected students can review and accept.

- **US-6.2: Offer Acceptance / Decline**
  - *As a* Student,
  - *I want to* accept or decline an offer,
  - *So that* my decision is recorded and my placement status updated.

- **US-6.3: TPO Placement Reports & CSV Export**
  - *As a* TPO,
  - *I want to* view analytics charts and download full placement reports as CSV,
  - *So that* I can fulfill college accreditation and governance reporting requirements.
