package com.internflow.modules.placementdrive;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreatePlacementDriveRequest {
    private String title;
    private String name;

    private String description;
    private String academicYear;
    private Integer batchYear;

    private Long companyId;
    private Long internshipId;

    private LocalDateTime driveDate;
    private String startDate;

    private LocalDateTime registrationDeadline;
    private String endDate;

    private String venueOrLink;
    private String eligibleBranches;
    private BigDecimal minCgpa;
    private Integer maxBacklogs;
    private String rulesSummary;

    public String getTitle() {
        if (title != null && !title.isBlank()) return title;
        if (name != null && !name.isBlank()) return name;
        return "Placement Drive";
    }

    public String getAcademicYear() {
        if (academicYear != null && !academicYear.isBlank()) return academicYear;
        if (batchYear != null) return (batchYear - 1) + "-" + batchYear;
        return "2025-2026";
    }

    public LocalDateTime getDriveDate() {
        if (driveDate != null) return driveDate;
        if (startDate != null && !startDate.isBlank()) {
            return startDate.contains("T") ? LocalDateTime.parse(startDate.replace("Z", "")) : java.time.LocalDate.parse(startDate).atStartOfDay();
        }
        return LocalDateTime.now().plusDays(7);
    }

    public LocalDateTime getRegistrationDeadline() {
        if (registrationDeadline != null) return registrationDeadline;
        if (endDate != null && !endDate.isBlank()) {
            return endDate.contains("T") ? LocalDateTime.parse(endDate.replace("Z", "")) : java.time.LocalDate.parse(endDate).atStartOfDay();
        }
        return getDriveDate().minusDays(2);
    }
}
