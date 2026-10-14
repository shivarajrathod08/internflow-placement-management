package com.internflow.modules.company;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateCompanyProfileRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;

    private String website;
    private String description;
    private String industry;
    private String location;
    private String logoUrl;
}
