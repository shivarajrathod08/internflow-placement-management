package com.internflow.modules.auth;

import com.internflow.common.ApiResponse;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for registration, login, and session validation")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password to receive JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register/student")
    @Operation(summary = "Register a new student account")
    public ResponseEntity<ApiResponse<AuthResponse>> registerStudent(@Valid @RequestBody RegisterStudentRequest request) {
        AuthResponse response = authService.registerStudent(request);
        return new ResponseEntity<>(ApiResponse.ok("Student registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/register/company")
    @Operation(summary = "Register a new company recruiter account (requires verification)")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCompany(@Valid @RequestBody RegisterCompanyRequest request) {
        AuthResponse response = authService.registerCompany(request);
        return new ResponseEntity<>(ApiResponse.ok("Company registered successfully. Profile is pending admin verification.", response), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        AuthResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password for the currently authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
