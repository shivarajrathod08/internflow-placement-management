package com.internflow.modules.audit;

import com.internflow.common.ApiResponse;
import com.internflow.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Administrator audit trail operations")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get paginated audit trail logs of sensitive platform actions")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogDTO>>> getLogs(
            @PageableDefault(size = 15) Pageable pageable) {
        Page<AuditLogDTO> page = auditService.getAuditLogs(pageable).map(AuditLogDTO::from);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @Data
    public static class AuditLogDTO {
        private Long id;
        private Long userId;
        private String userEmail;
        private String role;
        private String action;
        private String entityName;
        private Long entityId;
        private String previousState;
        private String newState;
        private String ipAddress;
        private String details;
        private LocalDateTime createdAt;

        public static AuditLogDTO from(AuditLog log) {
            AuditLogDTO dto = new AuditLogDTO();
            dto.setId(log.getId());
            dto.setUserId(log.getUserId());
            dto.setUserEmail(log.getUserEmail());
            dto.setRole(log.getRole());
            dto.setAction(log.getAction());
            dto.setEntityName(log.getEntityName());
            dto.setEntityId(log.getEntityId());
            dto.setPreviousState(log.getPreviousState());
            dto.setNewState(log.getNewState());
            dto.setIpAddress(log.getIpAddress());
            dto.setDetails(log.getDetails());
            dto.setCreatedAt(log.getCreatedAt());
            return dto;
        }
    }
}
