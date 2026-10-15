package com.internflow.modules.company;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyCompanyRequest {
    @NotNull(message = "Verification status is required")
    private CompanyVerificationStatus status; // APPROVED, REJECTED, SUSPENDED

    private String rejectionReason;
    private String notes;

    public String getRejectionReason() {
        if (rejectionReason != null && !rejectionReason.isBlank()) {
            return rejectionReason;
        }
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
        if (this.rejectionReason == null) {
            this.rejectionReason = notes;
        }
    }
}
