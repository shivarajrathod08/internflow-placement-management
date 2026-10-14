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
public class SkillGapDTO {
    private String internshipTitle;
    private String companyName;
    private int matchScore;
    private boolean eligible;
    private List<String> missingRequiredSkills;
    private List<String> missingPreferredSkills;
    private List<String> recommendations;
}
