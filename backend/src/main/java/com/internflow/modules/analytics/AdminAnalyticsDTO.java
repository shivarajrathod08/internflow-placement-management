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
public class AdminAnalyticsDTO {
    private long totalStudents;
    private long totalCompanies;
    private long verifiedCompanies;
    private long pendingCompanies;

    private long totalInternships;
    private long publishedInternships;
    private long pendingInternships;

    private long totalApplications;
    private long shortlistedCount;
    private long selectedCount;
    private long completedCount;

    private double shortlistRate;
    private double selectionRate;
    private double completionRate;

    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> topDemandedSkills;
    private Map<String, Long> internshipsByWorkMode;
}
