package com.internflow.modules.document;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyDocumentRequest {
    @NotNull(message = "Status is required")
    private VerificationStatus status; // VERIFIED, REJECTED

    private String rejectionReason;
}
