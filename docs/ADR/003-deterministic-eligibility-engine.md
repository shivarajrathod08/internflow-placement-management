# ADR 003: Deterministic Eligibility Engine Architecture

## Status
Accepted

## Context
College recruitment policies involve strict criteria regarding academic branch, minimum cumulative GPA (CGPA), backlog count, and graduation year. Students need immediate, transparent explanations of their eligibility before applying, and the backend must strictly enforce these criteria upon application submission.

## Decision
1. Implement a dedicated `EligibilityEngineService` evaluating:
   - **Allowed Branches**: Comma-separated list or collection matched against student branch (case-insensitive, trimmed).
   - **Minimum CGPA**: Student's current CGPA must equal or exceed opportunity requirement.
   - **Backlog Policy**: Maximum permissible active backlogs (e.g. 0 active backlogs for tier-1 IT firms).
   - **Graduation Year**: Candidate graduation year matching opportunity recruitment cycle.
   - **Verification State**: Opportunity may require institutional profile verification.
2. Return a structured `EligibilityEvaluationResult` containing boolean status (`eligible`), status enum (`ELIGIBLE`, `INELIGIBLE`, `AWAITING_VERIFICATION`), and an array of granular, human-readable explanations.
3. Automatically execute this engine in `ApplicationService.apply(...)` to reject ineligible applications at the server level regardless of client-side bypasses.

## Consequences
- High transparency for students.
- Zero reliance on client-side validation alone.
- Fully unit-testable evaluation logic without database side effects.
