package com.internflow.modules.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileDTO {
    private Long id;
    private Long userId;
    private String email;
    private String companyName;
    private String website;
    private String description;
    private String industry;
    private String location;
    private String logoUrl;
    private CompanyVerificationStatus verificationStatus;
    private String rejectionReason;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;

    public static CompanyProfileDTO from(Company c) {
        return CompanyProfileDTO.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .email(c.getUser().getEmail())
                .companyName(c.getCompanyName())
                .website(c.getWebsite())
                .description(c.getDescription())
                .industry(c.getIndustry())
                .location(c.getLocation())
                .logoUrl(c.getLogoUrl())
                .verificationStatus(c.getVerificationStatus())
                .rejectionReason(c.getRejectionReason())
                .verifiedAt(c.getVerifiedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
