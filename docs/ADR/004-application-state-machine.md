# ADR 004: Application State Machine & Lifecycle Transitions

## Status
Accepted

## Context
Recruitment workflows require strict state transition rules to ensure candidate applications move logically through screening, shortlisting, technical rounds, and offer issuance without skips or invalid jumps.

## Decision
1. Define formal application states:
   - `APPLIED`: Initial student submission.
   - `UNDER_REVIEW`: Application opened by recruiter or TPO.
   - `SHORTLISTED`: Candidate selected for interview evaluation.
   - `INTERVIEW_SCHEDULED`: One or more interview rounds assigned.
   - `OFFERED`: Formal offer recorded.
   - `ACCEPTED`: Student accepted the offer.
   - `REJECTED`: Candidate not selected at any intermediate stage.
   - `WITHDRAWN`: Candidate voluntarily retracted submission before offer.
2. Centralize validation in `ApplicationStateMachine.validateTransition(currentStatus, targetStatus)`.
3. Persist every state change in `application_status_history` with the changing actor's user ID, timestamp, and optional remarks.

## Consequences
- Guaranteed recruitment pipeline integrity.
- Auditable history of every candidate's lifecycle.
