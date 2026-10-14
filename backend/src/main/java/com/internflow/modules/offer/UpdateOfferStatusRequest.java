package com.internflow.modules.offer;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOfferStatusRequest {
    @NotNull(message = "Offer status is required")
    private OfferStatus status;

    private String responseNotes;
    private String studentRemarks;

    public String getResponseNotes() {
        if (responseNotes != null && !responseNotes.isBlank()) {
            return responseNotes;
        }
        return studentRemarks;
    }

    public void setStatus(Object statusObj) {
        if (statusObj == null) {
            this.status = null;
        } else if (statusObj instanceof OfferStatus os) {
            this.status = os;
        } else {
            String str = statusObj.toString().trim().toUpperCase();
            if ("REJECTED".equals(str)) {
                this.status = OfferStatus.DECLINED;
            } else {
                this.status = OfferStatus.valueOf(str);
            }
        }
    }
}
