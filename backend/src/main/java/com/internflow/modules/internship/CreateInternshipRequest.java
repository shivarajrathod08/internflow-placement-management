package com.internflow.modules.internship;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateInternshipRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String location;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths = 6;

    private BigDecimal stipendPerMonth = BigDecimal.ZERO;

    private BigDecimal minCgpa = BigDecimal.ZERO;

    private Integer maxBacklogs = 0;

    private String allowedBranches; // e.g. "Computer Science, IT" or "All Branches"

    private Integer graduationYear;

    @NotNull(message = "Application deadline is required")
    @Future(message = "Application deadline must be in the future")
    private LocalDateTime applicationDeadline;

    @Min(value = 1, message = "At least 1 opening is required")
    private Integer openings = 1;

    private List<String> requiredSkills;
    private List<String> preferredSkills;
}
