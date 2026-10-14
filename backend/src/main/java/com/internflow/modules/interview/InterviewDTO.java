package com.internflow.modules.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDTO {
    private Long id;
    private Long applicationId;
    private Long internshipId;
    private String internshipTitle;
    private String companyName;
    private String companyLogo;

    private Long studentId;
    private String studentName;
    private String studentEmail;

    private LocalDateTime scheduledAt;
    private String meetingLink;
    private InterviewMode mode;
    private InterviewStatus status;
    private String feedback;
    private Integer rating;
    private LocalDateTime createdAt;

    public static InterviewDTO from(Interview i) {
        return InterviewDTO.builder()
                .id(i.getId())
                .applicationId(i.getApplication().getId())
                .internshipId(i.getApplication().getInternship().getId())
                .internshipTitle(i.getApplication().getInternship().getTitle())
                .companyName(i.getApplication().getInternship().getCompany().getCompanyName())
                .companyLogo(i.getApplication().getInternship().getCompany().getLogoUrl())
                .studentId(i.getApplication().getStudent().getId())
                .studentName(i.getApplication().getStudent().getFirstName() + " " + i.getApplication().getStudent().getLastName())
                .studentEmail(i.getApplication().getStudent().getUser().getEmail())
                .scheduledAt(i.getScheduledAt())
                .meetingLink(i.getMeetingLink())
                .mode(i.getMode())
                .status(i.getStatus())
                .feedback(i.getFeedback())
                .rating(i.getRating())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
