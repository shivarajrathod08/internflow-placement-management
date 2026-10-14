package com.internflow.modules.interview;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InterviewFeedbackRequest {
    private InterviewStatus status; // COMPLETED, CANCELLED
    private String outcome;
    private String feedback;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    public InterviewStatus getStatus() {
        if (status != null) return status;
        if (outcome != null) {
            if ("CANCELLED".equalsIgnoreCase(outcome)) return InterviewStatus.CANCELLED;
            return InterviewStatus.COMPLETED;
        }
        return InterviewStatus.COMPLETED;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
        if (this.status == null && outcome != null) {
            if ("CANCELLED".equalsIgnoreCase(outcome)) {
                this.status = InterviewStatus.CANCELLED;
            } else {
                this.status = InterviewStatus.COMPLETED;
            }
        }
    }
}
