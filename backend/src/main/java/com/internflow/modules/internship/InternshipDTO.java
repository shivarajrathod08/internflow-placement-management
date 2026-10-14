package com.internflow.modules.internship;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternshipDTO {
    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private String companyIndustry;
    private String title;
    private String description;
    private String location;
    private WorkMode workMode;
    private Integer durationMonths;
    private BigDecimal stipendPerMonth;
    private BigDecimal minCgpa;
    private Integer maxBacklogs;
    private String allowedBranches;
    private Integer graduationYear;
    private LocalDateTime applicationDeadline;
    private Integer openings;
    private InternshipStatus status;
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;

    private List<String> requiredSkills;
    private List<String> preferredSkills;
    private long applicantCount;

    public static InternshipDTO from(Internship i) {
        List<String> reqSkills = i.getSkills() != null
                ? i.getSkills().stream().filter(InternshipSkill::isRequired).map(s -> s.getSkill().getCanonicalName()).toList()
                : List.of();

        List<String> prefSkills = i.getSkills() != null
                ? i.getSkills().stream().filter(s -> !s.isRequired()).map(s -> s.getSkill().getCanonicalName()).toList()
                : List.of();

        return InternshipDTO.builder()
                .id(i.getId())
                .companyId(i.getCompany().getId())
                .companyName(i.getCompany().getCompanyName())
                .companyLogo(i.getCompany().getLogoUrl())
                .companyIndustry(i.getCompany().getIndustry())
                .title(i.getTitle())
                .description(i.getDescription())
                .location(i.getLocation())
                .workMode(i.getWorkMode())
                .durationMonths(i.getDurationMonths())
                .stipendPerMonth(i.getStipendPerMonth())
                .minCgpa(i.getMinCgpa())
                .maxBacklogs(i.getMaxBacklogs())
                .allowedBranches(i.getAllowedBranches())
                .graduationYear(i.getGraduationYear())
                .applicationDeadline(i.getApplicationDeadline())
                .openings(i.getOpenings())
                .status(i.getStatus())
                .rejectionReason(i.getRejectionReason())
                .approvedAt(i.getApprovedAt())
                .createdAt(i.getCreatedAt())
                .requiredSkills(reqSkills)
                .preferredSkills(prefSkills)
                .build();
    }
}
