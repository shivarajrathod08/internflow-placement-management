package com.internflow.modules.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationDTO {
    private Long id;
    private String name;
    private String issuingOrg;
    private String issueDate;
    private String credentialUrl;

    public static CertificationDTO from(StudentCertification c) {
        return CertificationDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .issuingOrg(c.getIssuingOrg())
                .issueDate(c.getIssueDate())
                .credentialUrl(c.getCredentialUrl())
                .build();
    }
}
