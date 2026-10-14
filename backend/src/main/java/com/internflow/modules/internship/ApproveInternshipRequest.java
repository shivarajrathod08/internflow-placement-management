package com.internflow.modules.internship;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveInternshipRequest {
    @NotNull(message = "Approval status is required")
    private Boolean approved;

    private String rejectionReason;
}
