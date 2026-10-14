package com.internflow.modules.internship;

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
@RequestMapping("/api/internships")
@RequiredArgsConstructor
@Tag(name = "Internships", description = "Endpoints for creating, managing, approving, and searching internship postings")
public class InternshipController {

    private final InternshipService internshipService;
    private final com.internflow.modules.student.StudentService studentService;
    private final com.internflow.modules.eligibility.EligibilityEngineService eligibilityEngineService;

    @GetMapping("/public")
    @Operation(summary = "Search and filter published internships with pagination")
    public ResponseEntity<ApiResponse<PageResponse<InternshipDTO>>> searchPublished(
            InternshipFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<InternshipDTO> page = internshipService.searchPublishedInternships(filter, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @GetMapping("/public/{id}")
    @Operation(summary = "Get single published internship details")
    public ResponseEntity<ApiResponse<InternshipDTO>> getPublishedById(@PathVariable Long id) {
        InternshipDTO dto = internshipService.getInternshipById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get internship details by ID")
    public ResponseEntity<ApiResponse<InternshipDTO>> getById(@PathVariable Long id) {
        InternshipDTO dto = internshipService.getInternshipById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Check deterministic eligibility and reasons for current student on this internship")
    public ResponseEntity<ApiResponse<com.internflow.modules.eligibility.EligibilityEvaluationResult>> checkEligibility(
            @PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        com.internflow.modules.student.Student student = studentService.getStudentByUserId(userId);
        Internship internship = internshipService.getInternshipEntity(id);
        com.internflow.modules.eligibility.EligibilityEvaluationResult result =
                eligibilityEngineService.evaluateEligibility(student, internship);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/company")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'TPO')")
    @Operation(summary = "Post a new internship (creates draft pending college approval)")
    public ResponseEntity<ApiResponse<InternshipDTO>> createInternship(@Valid @RequestBody CreateInternshipRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        InternshipDTO created = internshipService.createInternship(userId, request);
        return new ResponseEntity<>(ApiResponse.ok("Internship created and submitted for admin review", created), HttpStatus.CREATED);
    }

    @GetMapping("/company")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'TPO')")
    @Operation(summary = "Get all internships posted by current recruiter's company")
    public ResponseEntity<ApiResponse<PageResponse<InternshipDTO>>> getCompanyInternships(
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<InternshipDTO> page = internshipService.getCompanyInternships(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @PatchMapping("/company/{id}/close")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'TPO')")
    @Operation(summary = "Close an internship posting")
    public ResponseEntity<ApiResponse<Void>> closeInternship(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        internshipService.closeInternship(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Internship marked as CLOSED", null));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO')")
    @Operation(summary = "Get all internships awaiting administrator approval")
    public ResponseEntity<ApiResponse<PageResponse<InternshipDTO>>> getPendingAdmin(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<InternshipDTO> page = internshipService.getPendingInternships(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO')")
    @Operation(summary = "Approve and publish, or reject an internship posting")
    public ResponseEntity<ApiResponse<InternshipDTO>> approveInternship(
            @PathVariable Long id,
            @Valid @RequestBody ApproveInternshipRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        InternshipDTO updated = internshipService.approveOrRejectInternship(id, request, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Internship status updated to " + updated.getStatus(), updated));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO')")
    @Operation(summary = "Get all internships across the platform (Admin / TPO)")
    public ResponseEntity<ApiResponse<PageResponse<InternshipDTO>>> getAllAdmin(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<InternshipDTO> page = internshipService.getAllInternshipsAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }
}
