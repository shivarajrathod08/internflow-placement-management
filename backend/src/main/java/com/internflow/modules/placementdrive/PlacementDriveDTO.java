package com.internflow.modules.placementdrive;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementDriveDTO {
    private Long id;
    private String title;
    private String description;
    private String academicYear;
    private Long companyId;
    private String companyName;
    private Long internshipId;
    private String internshipTitle;
    private LocalDateTime driveDate;
    private LocalDateTime registrationDeadline;
    private String venueOrLink;
    private PlacementDriveStatus status;
    private String eligibleBranches;
    private BigDecimal minCgpa;
    private String rulesSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PlacementDriveDTO from(PlacementDrive d) {
        return PlacementDriveDTO.builder()
                .id(d.getId())
                .title(d.getTitle())
                .description(d.getDescription())
                .academicYear(d.getAcademicYear())
                .companyId(d.getCompany() != null ? d.getCompany().getId() : null)
                .companyName(d.getCompany() != null ? d.getCompany().getCompanyName() : null)
                .internshipId(d.getInternship() != null ? d.getInternship().getId() : null)
                .internshipTitle(d.getInternship() != null ? d.getInternship().getTitle() : null)
                .driveDate(d.getDriveDate())
                .registrationDeadline(d.getRegistrationDeadline())
                .venueOrLink(d.getVenueOrLink())
                .status(d.getStatus())
                .eligibleBranches(d.getEligibleBranches())
                .minCgpa(d.getMinCgpa())
                .rulesSummary(d.getRulesSummary())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }

    public String getName() {
        return title;
    }

    public String getStartDate() {
        return driveDate != null ? driveDate.toString() : null;
    }

    public String getEndDate() {
        return registrationDeadline != null ? registrationDeadline.toString() : null;
    }

    public Integer getBatchYear() {
        try {
            if (academicYear != null && academicYear.contains("-")) {
                String[] parts = academicYear.split("-");
                return Integer.parseInt(parts[1].trim());
            }
        } catch (Exception ignored) {}
        return 2026;
    }
}
