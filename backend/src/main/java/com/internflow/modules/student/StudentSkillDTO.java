package com.internflow.modules.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillDTO {
    private Long id;
    private Long skillId;
    private String skillName;
    private String category;
    private String proficiencyLevel;
    private BigDecimal yearsExperience;

    public static StudentSkillDTO from(StudentSkill ss) {
        return StudentSkillDTO.builder()
                .id(ss.getId())
                .skillId(ss.getSkill().getId())
                .skillName(ss.getSkill().getCanonicalName())
                .category(ss.getSkill().getCategory())
                .proficiencyLevel(ss.getProficiencyLevel())
                .yearsExperience(ss.getYearsExperience())
                .build();
    }
}
