package com.internflow.modules.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationHistoryDTO {
    private Long id;
    private ApplicationStatus fromStatus;
    private ApplicationStatus toStatus;
    private String changedByEmail;
    private String notes;
    private LocalDateTime createdAt;

    public static ApplicationHistoryDTO from(ApplicationStatusHistory h) {
        return ApplicationHistoryDTO.builder()
                .id(h.getId())
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .changedByEmail(h.getChangedByUser() != null ? h.getChangedByUser().getEmail() : "SYSTEM")
                .notes(h.getNotes())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
