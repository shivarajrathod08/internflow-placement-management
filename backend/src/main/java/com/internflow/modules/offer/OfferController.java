package com.internflow.modules.offer;

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

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Tag(name = "Offers", description = "Endpoints for issuing, tracking, accepting, and declining internship & placement offers")
public class OfferController {

    private final OfferService offerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'TPO', 'ADMIN')")
    @Operation(summary = "Issue a formal offer to a candidate")
    public ResponseEntity<ApiResponse<OfferDTO>> createOffer(@Valid @RequestBody CreateOfferRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        OfferDTO created = offerService.createOffer(request, userId);
        return new ResponseEntity<>(ApiResponse.ok("Offer issued successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Accept, decline, or revoke an offer")
    public ResponseEntity<ApiResponse<OfferDTO>> updateOfferStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOfferStatusRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        OfferDTO updated = offerService.updateOfferStatus(id, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Offer status updated to " + request.getStatus(), updated));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get offers received by the current logged-in student")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getMyOffers() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<OfferDTO> offers = offerService.getOffersForStudent(userId);
        return ResponseEntity.ok(ApiResponse.ok(offers));
    }

    @GetMapping("/company")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER')")
    @Operation(summary = "Get all offers extended by current recruiter's company")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getCompanyOffers() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<OfferDTO> offers = offerService.getOffersForCompany(userId);
        return ResponseEntity.ok(ApiResponse.ok(offers));
    }

    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'ADMIN', 'TPO')")
    @Operation(summary = "Get all offers extended by a company ID")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getOffersByCompanyId(@PathVariable Long companyId) {
        List<OfferDTO> offers = offerService.getOffersByCompanyEntityId(companyId);
        return ResponseEntity.ok(ApiResponse.ok(offers));
    }

    @GetMapping({"", "/all"})
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN', 'FACULTY_COORDINATOR')")
    @Operation(summary = "Get all offers across the college (TPO / Admin / Faculty Coordinator)")
    public ResponseEntity<ApiResponse<PageResponse<OfferDTO>>> getAllOffers(
            @PageableDefault(size = 10, sort = "offerDate") Pageable pageable) {
        Page<OfferDTO> page = offerService.getAllOffers(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }
}
