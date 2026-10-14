package com.internflow.modules.notification;

import com.internflow.common.ApiResponse;
import com.internflow.common.PageResponse;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for viewing and acknowledging in-app notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get paginated notification history for current user")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> getNotifications(
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<NotificationDTO> page = notificationService.getUserNotifications(userId, pageable).map(NotificationDTO::from);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get 10 most recent notifications for current user")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getRecentNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<NotificationDTO> list = notificationService.getRecentUserNotifications(userId).stream().map(NotificationDTO::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.ok(count));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @Data
    public static class NotificationDTO {
        private Long id;
        private String title;
        private String message;
        private NotificationType type;
        private boolean read;
        private String linkUrl;
        private LocalDateTime createdAt;

        public static NotificationDTO from(Notification n) {
            NotificationDTO dto = new NotificationDTO();
            dto.setId(n.getId());
            dto.setTitle(n.getTitle());
            dto.setMessage(n.getMessage());
            dto.setType(n.getType());
            dto.setRead(n.isRead());
            dto.setLinkUrl(n.getLinkUrl());
            dto.setCreatedAt(n.getCreatedAt());
            return dto;
        }
    }
}
