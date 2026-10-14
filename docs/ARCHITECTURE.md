# InternFlow System Architecture Document

## 1. High-Level Architectural Topology

InternFlow follows a layered, domain-driven architecture designed for enterprise horizontal scalability, high transaction throughput, and strict security isolation.

```mermaid
graph TD
    Client[React 18 + TypeScript Client] -->|HTTPS / REST / JWT| Gateway[NGINX Gateway / Reverse Proxy]
    Gateway -->|Forward /api| SpringBoot[Spring Boot 3.3.4 Application Server]
    
    subgraph SpringBoot [Spring Boot Core Container]
        Security[Spring Security + Stateless JWT Filter]
        Controllers[REST Controllers Layer]
        Services[Domain Services & State Machines]
        MatchingEngine[5-Factor Explainable Matching Engine]
        Repositories[Spring Data JPA Repositories]
        AuditAspect[Audit Logging System]
    end

    Services --> MatchingEngine
    Controllers --> Services
    Services --> Repositories
    Services --> AuditAspect

    Repositories -->|JDBC / Connection Pooling| MySQL[(MySQL 8.0 Primary Relational DB)]
    Services -->|Secure File Stream| FileStore[Encrypted Storage Volume /resumes & /documents]
```

---

## 2. Strict 12-Stage Application State Machine

Applications transition strictly according to the platform state machine. Any arbitrary jump or bypass throws `InvalidStateTransitionException` and generates an audit log warning.

```mermaid
stateDiagram-v2
    [*] --> APPLIED: Student Submits Application
    APPLIED --> UNDER_REVIEW: Recruiter Opens Review
    APPLIED --> SHORTLISTED: Direct Shortlist
    APPLIED --> REJECTED: Candidate Rejected
    APPLIED --> WITHDRAWN: Student Withdraws

    UNDER_REVIEW --> SHORTLISTED: Pass Initial Screening
    UNDER_REVIEW --> REJECTED: Fail Screening
    UNDER_REVIEW --> WITHDRAWN: Student Withdraws

    SHORTLISTED --> INTERVIEW_SCHEDULED: Technical Round Fixed
    SHORTLISTED --> SELECTED: Direct Placement Offer
    SHORTLISTED --> REJECTED: Decline

    INTERVIEW_SCHEDULED --> INTERVIEW_COMPLETED: Round Completed
    INTERVIEW_SCHEDULED --> REJECTED: Round Failed

    INTERVIEW_COMPLETED --> SELECTED: Offer Extended
    INTERVIEW_COMPLETED --> INTERVIEW_SCHEDULED: Next Interview Round
    INTERVIEW_COMPLETED --> REJECTED: Round Failed

    SELECTED --> JOINED: Student Accepts Offer & Joins
    SELECTED --> REJECTED: Offer Rescinded / Declined

    JOINED --> IN_PROGRESS: Internship Period Commences
    IN_PROGRESS --> COMPLETION_SUBMITTED: Final Report Uploaded
    COMPLETION_SUBMITTED --> VERIFICATION_PENDING: Queued for Admin Review
    VERIFICATION_PENDING --> COMPLETED: College Admin Approves & Credits
    VERIFICATION_PENDING --> IN_PROGRESS: Revisions Requested

    COMPLETED --> [*]
    REJECTED --> [*]
    WITHDRAWN --> [*]
```

### Transition Validation Rules
1. **Withdrawal Constraint**: A candidate may only withdraw when the application is in early stages (`APPLIED`, `UNDER_REVIEW`). Once an interview is scheduled or an offer extended, withdrawals require administrative clearance.
2. **Deterministic Stage Progression**: Moving to `JOINED` requires verified student placement records.
3. **Completion Clearance**: An internship is only marked `COMPLETED` once the College Placement Office authenticates the corporate completion certificate and evaluation report.

---

## 3. Explainable 5-Factor Matching Algorithm

Unlike opaque neural approaches that hallucinate recommendations, InternFlow implements a **deterministic, explainable algorithm** grounded in candidate competencies, academic thresholds, and experiential track records.

$$\text{Total Match Score} = S_{\text{req}} + S_{\text{pref}} + S_{\text{exp}} + S_{\text{acad}} + S_{\text{comp}}$$

### Mathematical Weight Formulation:

| Component | Weight | Max Points | Formulation & Rules |
| :--- | :---: | :---: | :--- |
| **Required Skills** ($S_{\text{req}}$) | 40% | 40 pts | $\frac{\text{Matched Required Skills}}{\text{Total Required Skills}} \times 40$<br>Canonical aliases automatically resolved. |
| **Preferred Skills** ($S_{\text{pref}}$) | 20% | 20 pts | $\frac{\text{Matched Preferred Skills}}{\text{Total Preferred Skills}} \times 20$<br>Evaluates bonus qualifications. |
| **Projects & Experience** ($S_{\text{exp}}$) | 15% | 15 pts | - Base: 5 pts for relevant verified projects<br>- Tech stack relevance: Up to 5 pts<br>- Prior internship experience: Up to 5 pts |
| **Academics & CGPA** ($S_{\text{acad}}$) | 15% | 15 pts | - If Student CGPA $\ge$ Min Required CGPA: 10 pts base<br>- Proportional bonus: $\min\left(5, \frac{\text{CGPA} - \text{Min}}{\text{10} - \text{Min}} \times 5\right)$<br>- Branch matching bonus included |
| **Profile Completeness** ($S_{\text{comp}}$) | 10% | 10 pts | Completeness percentage of resume, bio, certifications, and LinkedIn/GitHub profiles ($\times 10$) |

### Hard Eligibility Filters
Before the score is computed, hard gate constraints are evaluated:
- **CGPA Gate**: $\text{Student CGPA} \ge \text{Posting Minimum CGPA}$
- **Graduation Year Gate**: Target graduation batch compatibility
- **Branch Gate**: Comma-separated allowed majors (`Computer Science`, `IT`, `Electronics`, etc.)

If any hard filter fails, `eligible = false`, and actionable notifications list exact remediation steps.

---

## 4. Canonical Skill Normalization Pipeline

Raw candidate input strings (e.g., `"react.js"`, `"ReactJS"`, `"k8s"`, `"golang"`) pass through the canonical resolution pipeline before storage or matching:

```
[Raw User Input: "k8s"]
         │
         ▼
[Trim & Lowercase: "k8s"]
         │
         ▼
[Check Canonical Skill Table] ──(Not Direct Match)──► [Check Skill Alias Mapping Table]
                                                                  │
                                                                  ▼
                                                      Found Alias: "k8s" → ID: 22
                                                                  │
                                                                  ▼
                                                  Canonicalized to: "Kubernetes"
```

This guarantees 100% precision in search, filtering, and scoring across diverse terminology used by students and recruiters.
