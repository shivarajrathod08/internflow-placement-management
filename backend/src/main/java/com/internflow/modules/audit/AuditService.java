package com.internflow.modules.audit;

import com.internflow.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String entityName, Long entityId, String previousState, String newState, String details) {
        try {
            Long userId = null;
            String userEmail = "ANONYMOUS";
            String role = "SYSTEM";

            try {
                userId = SecurityUtils.getCurrentUserId();
                userEmail = SecurityUtils.getCurrentUserEmail();
                role = SecurityUtils.getCurrentUserRole().name();
            } catch (Exception ignored) {
                // Background task or unauthenticated operation
            }

            String ipAddress = "127.0.0.1";
            try {
                ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    HttpServletRequest req = attrs.getRequest();
                    String xForwardedFor = req.getHeader("X-Forwarded-For");
                    if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                        ipAddress = xForwardedFor.split(",")[0].trim();
                    } else {
                        ipAddress = req.getRemoteAddr();
                    }
                }
            } catch (Exception ignored) {}

            AuditLog logEntry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .role(role)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .previousState(previousState)
                    .newState(newState)
                    .ipAddress(ipAddress)
                    .details(details)
                    .build();

            auditLogRepository.save(logEntry);
            log.info("AUDIT: [{}] {} on {}:{} - Details: {}", role, action, entityName, entityId, details);
        } catch (Exception ex) {
            log.error("Failed to write audit log entry", ex);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
