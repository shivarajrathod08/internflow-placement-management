package com.internflow.modules.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDTO {
    private Long id;
    private String organizationName;
    private String role;
    private String startDate;
    private String endDate;
    private boolean current;
    private String description;

    public static ExperienceDTO from(StudentExperience e) {
        return ExperienceDTO.builder()
                .id(e.getId())
                .organizationName(e.getOrganizationName())
                .role(e.getRole())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .current(e.isCurrent())
                .description(e.getDescription())
                .build();
    }
}
