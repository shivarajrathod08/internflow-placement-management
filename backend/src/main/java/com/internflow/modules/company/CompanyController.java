package com.internflow.modules.company;

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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
@Tag(name = "Company", description = "Company recruiter profile and verification operations")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Get current recruiter's company profile")
    public ResponseEntity<ApiResponse<CompanyProfileDTO>> getMyCompanyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        CompanyProfileDTO profile = companyService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Update current recruiter's company profile details")
    public ResponseEntity<ApiResponse<CompanyProfileDTO>> updateMyCompanyProfile(@Valid @RequestBody UpdateCompanyProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CompanyProfileDTO profile = companyService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Company profile updated successfully", profile));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyProfileDTO>> getCompanyById(@PathVariable Long id) {
        CompanyProfileDTO profile = companyService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    // Admin endpoints for company management
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List companies pending administrator KYC verification")
    public ResponseEntity<ApiResponse<PageResponse<CompanyProfileDTO>>> getPendingCompanies(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CompanyProfileDTO> page = companyService.getCompaniesByStatus(CompanyVerificationStatus.PENDING, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all registered companies (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<CompanyProfileDTO>>> getAllCompanies(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CompanyProfileDTO> page = companyService.getAllCompanies(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @PostMapping("/admin/{companyId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve, reject, or suspend a company (Admin)")
    public ResponseEntity<ApiResponse<CompanyProfileDTO>> verifyCompany(
            @PathVariable Long companyId,
            @Valid @RequestBody VerifyCompanyRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        CompanyProfileDTO updated = companyService.verifyCompany(companyId, request, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Company verification status updated to " + request.getStatus(), updated));
    }
}
