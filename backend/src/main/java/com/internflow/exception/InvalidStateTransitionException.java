package com.internflow.exception;

import org.springframework.http.HttpStatus;

public class InvalidStateTransitionException extends ApiException {
    public InvalidStateTransitionException(String currentStatus, String targetStatus) {
        super(String.format("Invalid state transition from '%s' to '%s'. This transition is not permitted by the workflow rules.", currentStatus, targetStatus), HttpStatus.CONFLICT);
    }
}
