package com.internflow.modules.offer;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOfferStatusRequest {
    @NotNull(message = "Offer status is required")
    private OfferStatus status;

    private String responseNotes;
}
