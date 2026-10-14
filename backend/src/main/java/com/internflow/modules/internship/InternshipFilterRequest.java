package com.internflow.modules.internship;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InternshipFilterRequest {
    private String query;
    private String location;
    private WorkMode workMode;
    private BigDecimal minStipend;
    private String skill;
    private String branch;
}
