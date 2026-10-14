package com.internflow.modules.offer;

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
public class OfferDTO {
    private Long id;
    private Long applicationId;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private String studentEmail;
    private Long companyId;
    private String companyName;
    private Long internshipId;
    private String internshipTitle;
    private String designation;
    private BigDecimal ctcOrStipend;
    private String offerLetterUrl;
    private LocalDateTime offerDate;
    private LocalDateTime joiningDate;
    private OfferStatus status;
    private String responseNotes;
    private LocalDateTime createdAt;

    public static OfferDTO from(Offer o) {
        return OfferDTO.builder()
                .id(o.getId())
                .applicationId(o.getApplication().getId())
                .studentId(o.getStudent().getId())
                .studentName(o.getStudent().getFirstName() + " " + o.getStudent().getLastName())
                .studentRollNumber(o.getStudent().getRollNumber())
                .studentEmail(o.getStudent().getUser().getEmail())
                .companyId(o.getCompany().getId())
                .companyName(o.getCompany().getCompanyName())
                .internshipId(o.getInternship().getId())
                .internshipTitle(o.getInternship().getTitle())
                .designation(o.getDesignation())
                .ctcOrStipend(o.getCtcOrStipend())
                .offerLetterUrl(o.getOfferLetterUrl())
                .offerDate(o.getOfferDate())
                .joiningDate(o.getJoiningDate())
                .status(o.getStatus())
                .responseNotes(o.getResponseNotes())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
