package com.internflow.modules.application;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateApplicationStatusRequest {
    @NotNull(message = "Target status is required")
    private ApplicationStatus targetStatus;

    private String notes;
}
