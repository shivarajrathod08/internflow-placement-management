package com.internflow.modules.student;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddSkillRequest {
    @NotBlank(message = "Skill name is required")
    private String skillName;

    private String proficiencyLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    private BigDecimal yearsExperience;
}
