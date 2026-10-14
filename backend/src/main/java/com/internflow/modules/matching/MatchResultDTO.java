package com.internflow.modules.matching;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultDTO {
    private int matchScore; // 0 to 100
    private boolean eligible;
    private List<String> eligibilityNotes;

    private List<String> matchedRequiredSkills;
    private List<String> missingRequiredSkills;
    private List<String> matchedPreferredSkills;
    private List<String> missingPreferredSkills;

    private double requiredSkillsScore; // out of 50
    private double preferredSkillsScore; // out of 20
    private double experienceScore; // out of 15
    private double academicScore; // out of 10
    private double completenessScore; // out of 5

    private String explanation;
}
