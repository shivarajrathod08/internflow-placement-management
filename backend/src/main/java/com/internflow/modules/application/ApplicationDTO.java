package com.internflow.modules.application;

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
public class ApplicationDTO {
    private Long id;
    private Long internshipId;
    private String internshipTitle;
    private String internshipLocation;
    private Long companyId;
    private String companyName;
    private String companyLogo;

    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String studentCollege;
    private String studentBranch;
    private BigDecimal studentCgpa;
    private String studentResumeUrl;

    private ApplicationStatus currentStatus;
    private String coverNote;
    private Integer matchScoreAtApplication;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    private List<ApplicationHistoryDTO> history;

    public static ApplicationDTO from(Application a) {
        List<ApplicationHistoryDTO> historyDTOs = a.getStatusHistory() != null
                ? a.getStatusHistory().stream().map(ApplicationHistoryDTO::from).toList()
                : List.of();

        String rawResumeUrl = a.getStudent().getResumeUrl();
        String studentResumeEndpoint = null;
        if (rawResumeUrl != null && !rawResumeUrl.isBlank()) {
            studentResumeEndpoint = "/api/applications/" + a.getId() + "/resume";
        }

        return ApplicationDTO.builder()
                .id(a.getId())
                .internshipId(a.getInternship().getId())
                .internshipTitle(a.getInternship().getTitle())
                .internshipLocation(a.getInternship().getLocation())
                .companyId(a.getInternship().getCompany().getId())
                .companyName(a.getInternship().getCompany().getCompanyName())
                .companyLogo(a.getInternship().getCompany().getLogoUrl())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFirstName() + " " + a.getStudent().getLastName())
                .studentEmail(a.getStudent().getUser().getEmail())
                .studentPhone(a.getStudent().getPhone())
                .studentCollege(a.getStudent().getCollege())
                .studentBranch(a.getStudent().getBranch())
                .studentCgpa(a.getStudent().getCgpa())
                .studentResumeUrl(studentResumeEndpoint)
                .currentStatus(a.getCurrentStatus())
                .coverNote(a.getCoverNote())
                .matchScoreAtApplication(a.getMatchScoreAtApplication())
                .appliedAt(a.getAppliedAt())
                .updatedAt(a.getUpdatedAt())
                .history(historyDTOs)
                .build();
    }
}
