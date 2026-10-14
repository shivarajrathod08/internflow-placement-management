package com.internflow.modules.interview;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ForbiddenException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.application.*;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.company.Company;
import com.internflow.modules.company.CompanyRepository;
import com.internflow.modules.notification.NotificationService;
import com.internflow.modules.notification.NotificationType;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentRepository;
import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final ApplicationStateMachine stateMachine;
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public InterviewDTO scheduleInterview(Long userId, ScheduleInterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Company ownership check
        if (!application.getInternship().getCompany().getUser().getId().equals(userId) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You do not have permission to schedule interviews for this candidate");
        }

        // Rule: Only shortlisted or under review candidates can be scheduled
        if (application.getCurrentStatus() != ApplicationStatus.SHORTLISTED &&
                application.getCurrentStatus() != ApplicationStatus.UNDER_REVIEW &&
                application.getCurrentStatus() != ApplicationStatus.INTERVIEW_COMPLETED) {
            throw new BadRequestException("Interviews can only be scheduled for candidates who are SHORTLISTED (Current: " + application.getCurrentStatus() + ")");
        }

        Interview interview = Interview.builder()
                .application(application)
                .scheduledAt(request.getScheduledAt())
                .meetingLink(request.getMeetingLink())
                .mode(request.getMode() != null ? request.getMode() : InterviewMode.ONLINE)
                .status(InterviewStatus.SCHEDULED)
                .build();

        Interview saved = interviewRepository.save(interview);

        // Advance application state to INTERVIEW_SCHEDULED if applicable
        if (application.getCurrentStatus() != ApplicationStatus.INTERVIEW_SCHEDULED) {
            ApplicationStatus from = application.getCurrentStatus();
            stateMachine.validateTransition(from, ApplicationStatus.INTERVIEW_SCHEDULED);
            application.setCurrentStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
            applicationRepository.save(application);

            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(application)
                    .fromStatus(from)
                    .toStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                    .changedByUser(currentUser)
                    .notes("Interview round scheduled for " + request.getScheduledAt())
                    .build();
            historyRepository.save(history);
        }

        auditService.log("SCHEDULE_INTERVIEW", "Interview", saved.getId(), null, "SCHEDULED",
                "Interview scheduled with " + application.getStudent().getFirstName() + " at " + request.getScheduledAt());

        // Notify student
        notificationService.createNotification(
                application.getStudent().getUser().getId(),
                "Interview Scheduled! 📅",
                String.format("You have an interview scheduled for '%s' with %s on %s.",
                        application.getInternship().getTitle(),
                        application.getInternship().getCompany().getCompanyName(),
                        request.getScheduledAt()),
                NotificationType.ACTION_REQUIRED,
                "/student/interviews"
        );

        return InterviewDTO.from(saved);
    }

    @Transactional
    public InterviewDTO rescheduleInterview(Long interviewId, Long userId, LocalDateTime newTime, String newLink) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isCompanyOwner = interview.getApplication().getInternship().getCompany().getUser().getId().equals(userId);
        boolean isAdminOrTpo = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.TPO;
        if (!isCompanyOwner && !isAdminOrTpo) {
            throw new ForbiddenException("Access denied to reschedule interview");
        }

        interview.setScheduledAt(newTime);
        if (newLink != null && !newLink.isBlank()) {
            interview.setMeetingLink(newLink);
        }
        interview.setStatus(InterviewStatus.RESCHEDULED);
        Interview saved = interviewRepository.save(interview);

        auditService.log("RESCHEDULE_INTERVIEW", "Interview", saved.getId(), "SCHEDULED", "RESCHEDULED",
                "Rescheduled to " + newTime);

        // Notify student
        notificationService.createNotification(
                interview.getApplication().getStudent().getUser().getId(),
                "Interview Rescheduled ⚠️",
                String.format("Your interview for '%s' has been rescheduled to %s.",
                        interview.getApplication().getInternship().getTitle(), newTime),
                NotificationType.WARNING,
                "/student/interviews"
        );

        return InterviewDTO.from(saved);
    }

    @Transactional
    public InterviewDTO submitFeedback(Long interviewId, Long userId, InterviewFeedbackRequest request) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isCompanyOwner = interview.getApplication().getInternship().getCompany().getUser().getId().equals(userId);
        boolean isAdminOrTpo = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.TPO;
        if (!isCompanyOwner && !isAdminOrTpo) {
            throw new ForbiddenException("Access denied to submit interview feedback");
        }

        interview.setStatus(request.getStatus());
        interview.setFeedback(request.getFeedback());
        interview.setRating(request.getRating());
        Interview saved = interviewRepository.save(interview);

        // If completed, advance application status to INTERVIEW_COMPLETED
        if (request.getStatus() == InterviewStatus.COMPLETED &&
                interview.getApplication().getCurrentStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {
            Application app = interview.getApplication();
            app.setCurrentStatus(ApplicationStatus.INTERVIEW_COMPLETED);
            applicationRepository.save(app);

            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(app)
                    .fromStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                    .toStatus(ApplicationStatus.INTERVIEW_COMPLETED)
                    .changedByUser(currentUser)
                    .notes("Interview conducted. Rating: " + request.getRating() + "/5. Notes: " + request.getFeedback())
                    .build();
            historyRepository.save(history);
        }

        auditService.log("SUBMIT_INTERVIEW_FEEDBACK", "Interview", saved.getId(), null, request.getStatus().name(),
                "Rating: " + request.getRating() + "/5");

        return InterviewDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<InterviewDTO> getStudentInterviews(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return interviewRepository.findByStudentId(student.getId()).stream().map(InterviewDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<InterviewDTO> getCompanyInterviews(Long userId, Pageable pageable) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return interviewRepository.findByCompanyId(company.getId(), pageable).map(InterviewDTO::from);
    }
}
