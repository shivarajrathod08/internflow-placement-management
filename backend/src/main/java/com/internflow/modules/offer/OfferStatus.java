package com.internflow.modules.offer;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum OfferStatus {
    OFFERED,
    ACCEPTED,
    DECLINED,
    JOINED,
    REVOKED;

    @JsonCreator
    public static OfferStatus fromString(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase();
        if ("REJECTED".equals(normalized)) {
            return DECLINED;
        }
        return OfferStatus.valueOf(normalized);
    }
}
