package com.internflow.modules.placementdrive;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreatePlacementDriveRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private Long companyId;
    private Long internshipId;

    @NotNull(message = "Drive date is required")
    private LocalDateTime driveDate;

    @NotNull(message = "Registration deadline is required")
    private LocalDateTime registrationDeadline;

    private String venueOrLink;
    private String eligibleBranches;
    private BigDecimal minCgpa;
    private String rulesSummary;
}
