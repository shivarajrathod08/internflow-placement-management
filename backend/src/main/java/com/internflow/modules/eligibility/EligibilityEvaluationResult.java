package com.internflow.modules.eligibility;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityEvaluationResult {
    private Long internshipId;
    private Long studentId;
    private boolean eligible;
    private EligibilityStatus status;
    @Builder.Default
    private List<String> reasons = new ArrayList<>();
    private EligibilityCriteriaDTO criteria;
}
