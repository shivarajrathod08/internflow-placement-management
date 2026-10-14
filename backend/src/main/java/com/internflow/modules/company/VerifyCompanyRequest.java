package com.internflow.modules.company;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyCompanyRequest {
    @NotNull(message = "Verification status is required")
    private CompanyVerificationStatus status; // APPROVED, REJECTED, SUSPENDED

    private String rejectionReason;
}
