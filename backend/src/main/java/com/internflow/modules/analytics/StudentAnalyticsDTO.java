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
public class StudentAnalyticsDTO {
    private long totalApplications;
    private long underReviewCount;
    private long shortlistedCount;
    private long interviewScheduledCount;
    private long selectedCount;
    private long completedCount;
    private int profileCompletionPercentage;

    private Map<String, Long> statusCounts;
}
