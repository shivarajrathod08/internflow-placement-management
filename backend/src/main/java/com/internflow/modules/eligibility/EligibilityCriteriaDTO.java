package com.internflow.modules.eligibility;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityCriteriaDTO {
    private BigDecimal minCgpa;
    private Integer maxBacklogs;
    private List<String> allowedBranches;
    private Integer graduationYear;
    private boolean requiresVerification;
}
