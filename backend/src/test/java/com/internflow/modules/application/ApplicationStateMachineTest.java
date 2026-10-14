package com.internflow.modules.application;

import com.internflow.exception.InvalidStateTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationStateMachineTest {

    private ApplicationStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new ApplicationStateMachine();
    }

    @Test
    @DisplayName("Should permit standard progression: APPLIED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW_SCHEDULED -> INTERVIEW_COMPLETED -> SELECTED -> JOINED -> IN_PROGRESS -> COMPLETION_SUBMITTED -> VERIFICATION_PENDING -> COMPLETED")
    void testStandardHappyPathTransitions() {
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW_SCHEDULED));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEW_COMPLETED));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.INTERVIEW_COMPLETED, ApplicationStatus.SELECTED));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.SELECTED, ApplicationStatus.JOINED));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.JOINED, ApplicationStatus.IN_PROGRESS));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.IN_PROGRESS, ApplicationStatus.COMPLETION_SUBMITTED));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.COMPLETION_SUBMITTED, ApplicationStatus.VERIFICATION_PENDING));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.VERIFICATION_PENDING, ApplicationStatus.COMPLETED));
    }

    @Test
    @DisplayName("Should reject invalid and arbitrary backwards transitions")
    void testRejectInvalidTransitions() {
        // Cannot revert COMPLETED to APPLIED
        assertFalse(stateMachine.isValidTransition(ApplicationStatus.COMPLETED, ApplicationStatus.APPLIED));
        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(ApplicationStatus.COMPLETED, ApplicationStatus.APPLIED));

        // Cannot skip directly from APPLIED to SELECTED
        assertFalse(stateMachine.isValidTransition(ApplicationStatus.APPLIED, ApplicationStatus.SELECTED));

        // Cannot revert SELECTED to UNDER_REVIEW
        assertFalse(stateMachine.isValidTransition(ApplicationStatus.SELECTED, ApplicationStatus.UNDER_REVIEW));

        // Terminal state REJECTED cannot transition further
        assertFalse(stateMachine.isValidTransition(ApplicationStatus.REJECTED, ApplicationStatus.APPLIED));
    }

    @Test
    @DisplayName("Should permit student withdrawal only in early stages")
    void testWithdrawalRules() {
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.APPLIED, ApplicationStatus.WITHDRAWN));
        assertTrue(stateMachine.isValidTransition(ApplicationStatus.UNDER_REVIEW, ApplicationStatus.WITHDRAWN));

        assertFalse(stateMachine.isValidTransition(ApplicationStatus.SHORTLISTED, ApplicationStatus.WITHDRAWN));
        assertFalse(stateMachine.isValidTransition(ApplicationStatus.SELECTED, ApplicationStatus.WITHDRAWN));
    }
}
