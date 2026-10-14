package com.internflow.modules.analytics;

import com.internflow.common.ApiResponse;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Real-time analytics and statistics computed from database")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO', 'FACULTY_COORDINATOR')")
    @Operation(summary = "Get platform-wide placement, student, company, and internship metrics")
    public ResponseEntity<ApiResponse<AdminAnalyticsDTO>> getAdminMetrics() {
        AdminAnalyticsDTO metrics = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping(value = "/export/placements.csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO', 'FACULTY_COORDINATOR')")
    @Operation(summary = "Export institutional placements report as downloadable CSV for college accreditation")
    public ResponseEntity<String> exportPlacementsCsv() {
        String csvData = analyticsService.generatePlacementsCsv();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"internflow_placements_report.csv\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csvData);
    }

    @GetMapping("/company")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER')")
    @Operation(summary = "Get hiring pipeline analytics, conversion rates, and applicant stats for company")
    public ResponseEntity<ApiResponse<CompanyAnalyticsDTO>> getCompanyMetrics() {
        Long userId = SecurityUtils.getCurrentUserId();
        CompanyAnalyticsDTO metrics = analyticsService.getCompanyAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get application statistics and status pipeline metrics for student")
    public ResponseEntity<ApiResponse<StudentAnalyticsDTO>> getStudentMetrics() {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentAnalyticsDTO metrics = analyticsService.getStudentAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}
