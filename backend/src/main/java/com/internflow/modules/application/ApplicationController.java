package com.internflow.modules.application;

import com.internflow.common.ApiResponse;
import com.internflow.common.PageResponse;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Endpoints for managing the end-to-end application lifecycle and state transitions")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/internships/{internshipId}/apply")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit an application to an internship (validates duplicates and eligibility)")
    public ResponseEntity<ApiResponse<ApplicationDTO>> apply(
            @PathVariable Long internshipId,
            @RequestBody(required = false) ApplyRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ApplicationDTO created = applicationService.applyToInternship(userId, internshipId, request);
        return new ResponseEntity<>(ApiResponse.ok("Application submitted successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all applications submitted by the current student")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDTO>>> getMyApplications(
            @PageableDefault(size = 10, sort = "appliedAt") Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<ApplicationDTO> page = applicationService.getStudentApplications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Withdraw an active application (only allowed in early stages)")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        applicationService.withdrawApplication(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Application withdrawn successfully", null));
    }

    @GetMapping("/company/internships/{internshipId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    @Operation(summary = "Get applications for a specific internship posting")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDTO>>> getApplicantsForInternship(
            @PathVariable Long internshipId,
            @PageableDefault(size = 10, sort = "appliedAt") Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<ApplicationDTO> page = applicationService.getInternshipApplications(internshipId, userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Get all applicants across all postings for current company")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDTO>>> getAllCompanyApplicants(
            @PageableDefault(size = 10, sort = "appliedAt") Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<ApplicationDTO> page = applicationService.getCompanyApplications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    @Operation(summary = "Advance or update application status through the strict state machine")
    public ResponseEntity<ApiResponse<ApplicationDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ApplicationDTO updated = applicationService.updateStatus(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Application status updated to " + request.getTargetStatus(), updated));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all applications on the platform with optional status filtering (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDTO>>> getAllAdmin(
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 15, sort = "appliedAt") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.getAllApplicationsAdmin(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }
}
