package com.internflow.modules.offer;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateOfferRequest {
    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotBlank(message = "Designation is required")
    private String designation;

    private BigDecimal ctcOrStipend;
    private BigDecimal stipendOrSalary;

    private String offerLetterUrl;
    private LocalDateTime joiningDate;

    public BigDecimal getCtcOrStipend() {
        if (ctcOrStipend != null) {
            return ctcOrStipend;
        }
        return stipendOrSalary != null ? stipendOrSalary : BigDecimal.ZERO;
    }

    public void setJoiningDate(Object dateObj) {
        if (dateObj == null) {
            this.joiningDate = null;
        } else if (dateObj instanceof LocalDateTime ldt) {
            this.joiningDate = ldt;
        } else {
            String str = dateObj.toString().trim();
            if (str.isEmpty()) {
                this.joiningDate = null;
            } else if (str.contains("T")) {
                this.joiningDate = LocalDateTime.parse(str.replace("Z", ""));
            } else {
                this.joiningDate = java.time.LocalDate.parse(str).atStartOfDay();
            }
        }
    }
}
