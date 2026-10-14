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

    @NotNull(message = "CTC or Stipend is required")
    @DecimalMin(value = "0.00", message = "Compensation must be non-negative")
    private BigDecimal ctcOrStipend;

    private String offerLetterUrl;
    private LocalDateTime joiningDate;
}
