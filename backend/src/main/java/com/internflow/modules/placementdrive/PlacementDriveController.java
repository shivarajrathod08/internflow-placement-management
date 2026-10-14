package com.internflow.modules.placementdrive;

import com.internflow.common.ApiResponse;
import com.internflow.common.PageResponse;
import com.internflow.modules.student.StudentProfileDTO;
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
@RequestMapping("/api/placement-drives")
@RequiredArgsConstructor
@Tag(name = "Placement Drives", description = "Endpoints for managing college recruitment drives and eligible candidate pools")
public class PlacementDriveController {

    private final PlacementDriveService driveService;

    @GetMapping
    @Operation(summary = "Get all placement drives with pagination")
    public ResponseEntity<ApiResponse<PageResponse<PlacementDriveDTO>>> getAllDrives(
            @PageableDefault(size = 10, sort = "driveDate") Pageable pageable) {
        Page<PlacementDriveDTO> page = driveService.getAllDrives(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get placement drive details by ID")
    public ResponseEntity<ApiResponse<PlacementDriveDTO>> getDriveById(@PathVariable Long id) {
        PlacementDriveDTO dto = driveService.getDriveById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    @Operation(summary = "Schedule a new campus placement drive (TPO / Admin)")
    public ResponseEntity<ApiResponse<PlacementDriveDTO>> createDrive(
            @Valid @RequestBody CreatePlacementDriveRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        PlacementDriveDTO created = driveService.createDrive(request, userId);
        return new ResponseEntity<>(ApiResponse.ok("Placement drive scheduled successfully", created), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN')")
    @Operation(summary = "Update placement drive status (TPO / Admin)")
    public ResponseEntity<ApiResponse<PlacementDriveDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) PlacementDriveStatus status,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        PlacementDriveStatus targetStatus = status;
        if (targetStatus == null && body != null && body.containsKey("status")) {
            targetStatus = PlacementDriveStatus.valueOf(body.get("status").toString().toUpperCase());
        }
        if (targetStatus == null) {
            throw new com.internflow.exception.BadRequestException("Placement drive status is required");
        }
        Long userId = SecurityUtils.getCurrentUserId();
        PlacementDriveDTO updated = driveService.updateStatus(id, targetStatus, userId);
        return ResponseEntity.ok(ApiResponse.ok("Drive status updated to " + targetStatus, updated));
    }

    @GetMapping("/{id}/eligible-candidates")
    @PreAuthorize("hasAnyRole('TPO', 'ADMIN', 'COMPANY', 'RECRUITER')")
    @Operation(summary = "List eligible student candidates for this placement drive")
    public ResponseEntity<ApiResponse<List<StudentProfileDTO>>> getEligibleCandidates(
            @PathVariable Long id) {
        List<StudentProfileDTO> candidates = driveService.getEligibleCandidates(id);
        return ResponseEntity.ok(ApiResponse.ok(candidates));
    }
}
