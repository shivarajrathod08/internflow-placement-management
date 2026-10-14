# ADR 005: Placement Drives & Offers Lifecycle Management

## Status
Accepted

## Context
A university placement cell coordinates recruitment drives (e.g., Campus Placement Season 2026) that group corporate visits, test dates, interview schedules, and candidate shortlists across departments. Additionally, once candidates are selected, a formal offer recording and acceptance workflow is required to track college placement percentages, average CTC, and prevent double acceptance beyond university guidelines.

## Decision
1. Implement `PlacementDrive` entity (`placement_drives` table):
   - Ties to companies, academic years, registration deadlines, and eligibility criteria.
   - Provides candidate discovery (`eligible-candidates` endpoint) so TPO can proactively prepare shortlists.
2. Implement `Offer` entity (`offers` table):
   - Links student, company, internship, and application.
   - Captures designation, CTC / stipend amount, offer date, and joining date.
   - Provides student acceptance/decline actions with state transitions (`OFFERED`, `ACCEPTED`, `DECLINED`).
   - Feeds into batch placement statistics.

## Consequences
- Enables TPO and placement staff to manage high-volume campus hiring cycles effectively.
- Provides persistent, real data backing institutional dashboards and CSV export compliance.
