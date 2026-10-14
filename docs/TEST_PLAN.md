# InternFlow — Test Plan & Quality Assurance Strategy

## 1. Test Levels & Methodology

```
+-------------------------------------------------------+
| E2E Workflow Tests (Playwright / Integration Flows)   |
+-------------------------------------------------------+
| Integration Tests (Spring Boot Test, MockMvc, JPA)    |
+-------------------------------------------------------+
| Unit Tests (Eligibility Engine, State Machine, DTOs)  |
+-------------------------------------------------------+
```

## 2. Test Coverage Matrix

### 2.1 Backend Unit & Integration Tests
1. **Authentication & Authorization**:
   - Valid credentials produce verified JWT tokens.
   - Bad credentials return 401 Unauthorized without disclosing account existence.
   - Role-based method protection (`@PreAuthorize`) blocks unprivileged roles.
   - Resource isolation: Recruiter A cannot query or mutate Recruiter B's applications or company records.
2. **Deterministic Eligibility Engine (`EligibilityEngineServiceTest`)**:
   - Eligible student passes with status `ELIGIBLE` and empty reasons.
   - Student with CGPA below requirement fails with explicit explanation.
   - Student with unapproved branch fails with branch list explanation.
   - Student exceeding active backlog limit fails with backlog count explanation.
   - Student awaiting institutional verification returns `AWAITING_VERIFICATION`.
3. **Application State Machine (`ApplicationStateMachineTest`)**:
   - Valid transitions: `APPLIED` -> `UNDER_REVIEW` -> `SHORTLISTED` -> `INTERVIEW_SCHEDULED` -> `OFFERED`.
   - Disallowed transitions: `APPLIED` -> `OFFERED` directly throws `InvalidStateTransitionException`.
   - Terminal states: `REJECTED`, `WITHDRAWN`, `ACCEPTED`.
4. **Placement Drives & Offers**:
   - Placement drive creation, candidate filtering, and interview round linking.
   - Offer creation, student acceptance/rejection lifecycle.
5. **Persistence & Migration Integrity**:
   - Flyway migrations execute successfully on empty schema.
   - Unique constraints prevent duplicate applications (`(internship_id, student_id)`).

### 2.2 Frontend Quality & Verification
1. **Component Rendering & Validation**:
   - Zod schema validation on forms with visual field error messages.
   - TanStack query cache management, loading spinners, and error banners.
2. **Role-Aware Route Protection**:
   - Student redirected away from TPO / Admin routes.
   - Unauthenticated users redirected to `/login`.
3. **Responsive UI & Visual Hierarchy**:
   - Desktop sidebar collapsible; mobile drawer responsive.
   - Polished color palette, badge colors according to status (`green` for APPROVED/ACCEPTED, `amber` for PENDING/UNDER_REVIEW, `rose` for REJECTED).

## 3. Automation & Verification Commands
- Backend Test Suite:
  `mvn test`
- Frontend Build & Type Check:
  `npm run build`
