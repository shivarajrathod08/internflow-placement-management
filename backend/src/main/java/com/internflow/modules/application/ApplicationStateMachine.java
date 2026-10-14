package com.internflow.modules.application;

import com.internflow.exception.InvalidStateTransitionException;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ApplicationStateMachine {

    private static final Map<ApplicationStatus, Set<ApplicationStatus>> VALID_TRANSITIONS = new EnumMap<>(ApplicationStatus.class);

    static {
        // Initial application
        VALID_TRANSITIONS.put(ApplicationStatus.APPLIED, Set.of(
                ApplicationStatus.UNDER_REVIEW,
                ApplicationStatus.WITHDRAWN
        ));

        // Company review
        VALID_TRANSITIONS.put(ApplicationStatus.UNDER_REVIEW, Set.of(
                ApplicationStatus.SHORTLISTED,
                ApplicationStatus.REJECTED,
                ApplicationStatus.WITHDRAWN
        ));

        // Shortlisted candidates
        VALID_TRANSITIONS.put(ApplicationStatus.SHORTLISTED, Set.of(
                ApplicationStatus.INTERVIEW_SCHEDULED,
                ApplicationStatus.REJECTED
        ));

        // Interview phase
        VALID_TRANSITIONS.put(ApplicationStatus.INTERVIEW_SCHEDULED, Set.of(
                ApplicationStatus.INTERVIEW_COMPLETED,
                ApplicationStatus.REJECTED
        ));

        VALID_TRANSITIONS.put(ApplicationStatus.INTERVIEW_COMPLETED, Set.of(
                ApplicationStatus.SELECTED,
                ApplicationStatus.OFFERED,
                ApplicationStatus.REJECTED,
                ApplicationStatus.INTERVIEW_SCHEDULED // Next interview round
        ));

        // Post-selection and joining
        VALID_TRANSITIONS.put(ApplicationStatus.SELECTED, Set.of(
                ApplicationStatus.OFFERED,
                ApplicationStatus.JOINED,
                ApplicationStatus.REJECTED // Declined offer
        ));

        VALID_TRANSITIONS.put(ApplicationStatus.OFFERED, Set.of(
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED
        ));

        VALID_TRANSITIONS.put(ApplicationStatus.ACCEPTED, Set.of(
                ApplicationStatus.JOINED
        ));

        VALID_TRANSITIONS.put(ApplicationStatus.JOINED, Set.of(
                ApplicationStatus.IN_PROGRESS
        ));

        // Execution and completion
        VALID_TRANSITIONS.put(ApplicationStatus.IN_PROGRESS, Set.of(
                ApplicationStatus.COMPLETION_SUBMITTED
        ));

        VALID_TRANSITIONS.put(ApplicationStatus.COMPLETION_SUBMITTED, Set.of(
                ApplicationStatus.VERIFICATION_PENDING,
                ApplicationStatus.IN_PROGRESS // Revisions requested
        ));

        VALID_TRANSITIONS.put(ApplicationStatus.VERIFICATION_PENDING, Set.of(
                ApplicationStatus.COMPLETED,
                ApplicationStatus.IN_PROGRESS // Admin rejected documents, back to in progress
        ));

        // Terminal states have no outbound transitions
        VALID_TRANSITIONS.put(ApplicationStatus.COMPLETED, Collections.emptySet());
        VALID_TRANSITIONS.put(ApplicationStatus.REJECTED, Collections.emptySet());
        VALID_TRANSITIONS.put(ApplicationStatus.WITHDRAWN, Collections.emptySet());
    }

    public boolean isValidTransition(ApplicationStatus from, ApplicationStatus to) {
        if (from == null || to == null) {
            return false;
        }
        if (from == to) {
            return true; // Idempotent no-op
        }
        Set<ApplicationStatus> permitted = VALID_TRANSITIONS.getOrDefault(from, Collections.emptySet());
        return permitted.contains(to);
    }

    public void validateTransition(ApplicationStatus from, ApplicationStatus to) {
        if (!isValidTransition(from, to)) {
            throw new InvalidStateTransitionException(
                    from != null ? from.name() : "NULL",
                    to != null ? to.name() : "NULL"
            );
        }
    }

    public Set<ApplicationStatus> getPermittedNextStates(ApplicationStatus current) {
        return Collections.unmodifiableSet(VALID_TRANSITIONS.getOrDefault(current, Collections.emptySet()));
    }
}
