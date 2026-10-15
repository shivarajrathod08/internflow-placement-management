package com.internflow.modules.interview;

import com.internflow.common.ApiResponse;
import com.internflow.common.PageResponse;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Tag(name = "Interviews", description = "Endpoints for scheduling, rescheduling, conducting interviews, and submitting candidate ratings")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping({"", "/schedule"})
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'ADMIN', 'TPO')")
    @Operation(summary = "Schedule an interview round for a shortlisted candidate")
    public ResponseEntity<ApiResponse<InterviewDTO>> scheduleInterview(@Valid @RequestBody ScheduleInterviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        InterviewDTO scheduled = interviewService.scheduleInterview(userId, request);
        return new ResponseEntity<>(ApiResponse.ok("Interview scheduled successfully", scheduled), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'ADMIN', 'TPO')")
    @Operation(summary = "Reschedule an existing interview")
    public ResponseEntity<ApiResponse<InterviewDTO>> rescheduleInterview(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        InterviewDTO rescheduled = interviewService.rescheduleInterview(id, userId, request.getNewScheduledAt(), request.getMeetingLink());
        return ResponseEntity.ok(ApiResponse.ok("Interview rescheduled successfully", rescheduled));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'ADMIN', 'TPO')")
    @Operation(summary = "Submit interview feedback, score, and completion outcome")
    public ResponseEntity<ApiResponse<InterviewDTO>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody InterviewFeedbackRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        InterviewDTO result = interviewService.submitFeedback(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Feedback submitted successfully", result));
    }

    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all scheduled interviews for current student")
    public ResponseEntity<ApiResponse<List<InterviewDTO>>> getStudentInterviews() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<InterviewDTO> list = interviewService.getStudentInterviews(userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/company")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER')")
    @Operation(summary = "Get all interviews scheduled by the company")
    public ResponseEntity<ApiResponse<PageResponse<InterviewDTO>>> getCompanyInterviews(
            @PageableDefault(size = 10, sort = "scheduledAt") Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<InterviewDTO> page = interviewService.getCompanyInterviews(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @Data
    public static class RescheduleRequest {
        private LocalDateTime newScheduledAt;
        private String meetingLink;
    }
}
