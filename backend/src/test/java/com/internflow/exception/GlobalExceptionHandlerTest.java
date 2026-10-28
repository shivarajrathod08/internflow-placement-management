package com.internflow.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/auth/login");
    }

    @Test
    @DisplayName("DisabledException returns 403 Forbidden with ACCOUNT_DISABLED")
    void testDisabledExceptionReturns403() {
        DisabledException ex = new DisabledException("User is disabled");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAccountStatusException(ex, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("ACCOUNT_DISABLED", response.getBody().getError());
        assertEquals("Your account is currently inactive or pending administrator approval.", response.getBody().getMessage());
        assertEquals("/api/auth/login", response.getBody().getPath());
    }

    @Test
    @DisplayName("LockedException returns 403 Forbidden with ACCOUNT_DISABLED")
    void testLockedExceptionReturns403() {
        LockedException ex = new LockedException("User account is locked");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAccountStatusException(ex, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("ACCOUNT_DISABLED", response.getBody().getError());
    }

    @Test
    @DisplayName("BadCredentialsException returns 401 Unauthorized with AUTHENTICATION_FAILED")
    void testBadCredentialsReturns401() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthenticationException(ex, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().getStatus());
        assertEquals("AUTHENTICATION_FAILED", response.getBody().getError());
        assertEquals("Invalid email or password. Please verify your credentials.", response.getBody().getMessage());
    }

    @Test
    @DisplayName("UsernameNotFoundException returns 401 Unauthorized with AUTHENTICATION_FAILED")
    void testUsernameNotFoundReturns401() {
        UsernameNotFoundException ex = new UsernameNotFoundException("User not found");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthenticationException(ex, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().getStatus());
        assertEquals("AUTHENTICATION_FAILED", response.getBody().getError());
    }

    @Test
    @DisplayName("DataIntegrityViolationException on email returns 409 Conflict")
    void testDataIntegrityViolationOnEmailReturns409() {
        org.springframework.dao.DataIntegrityViolationException ex =
                new org.springframework.dao.DataIntegrityViolationException("duplicate key value violates unique constraint 'users_email_key'");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolation(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("DUPLICATE_RESOURCE", response.getBody().getError());
        assertEquals("An account with this email address already exists. Please sign in instead.", response.getBody().getMessage());
    }

    @Test
    @DisplayName("General DataIntegrityViolationException returns 400 Bad Request")
    void testGeneralDataIntegrityViolationReturns400() {
        org.springframework.dao.DataIntegrityViolationException ex =
                new org.springframework.dao.DataIntegrityViolationException("null value in column 'company_name' violates not-null constraint");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolation(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("DATA_INTEGRITY_VIOLATION", response.getBody().getError());
    }
}
