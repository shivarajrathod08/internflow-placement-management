package com.internflow.modules.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAnalyticsDTO {
    private long totalPostings;
    private long publishedPostings;
    private long pendingPostings;

    private long totalApplicants;
    private long shortlistedApplicants;
    private long interviewedApplicants;
    private long selectedApplicants;

    private double shortlistConversionRate;
    private double hireConversionRate;

    private Map<String, Long> applicationsByStatus;
}
