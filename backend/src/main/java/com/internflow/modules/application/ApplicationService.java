package com.internflow.modules.application;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ForbiddenException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.internship.Internship;
import com.internflow.modules.internship.InternshipRepository;
import com.internflow.modules.internship.InternshipStatus;
import com.internflow.modules.matching.MatchResultDTO;
import com.internflow.modules.matching.MatchingEngineService;
import com.internflow.modules.notification.NotificationService;
import com.internflow.modules.notification.NotificationType;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentRepository;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final InternshipRepository internshipRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ApplicationStateMachine stateMachine;
    private final MatchingEngineService matchingEngineService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final com.internflow.modules.eligibility.EligibilityEngineService eligibilityEngineService;

    @Transactional
    public ApplicationDTO applyToInternship(Long userId, Long internshipId, ApplyRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship", "id", internshipId));

        // Rule 1: Internship must be PUBLISHED
        if (internship.getStatus() != InternshipStatus.PUBLISHED) {
            throw new BadRequestException("Applications are closed for this posting. Current status: " + internship.getStatus());
        }

        // Rule 2: Deadline check
        if (internship.getApplicationDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Application deadline has passed (" + internship.getApplicationDeadline() + ")");
        }

        // Rule 3: Duplicate application prevention (App Layer)
        if (applicationRepository.existsByInternshipIdAndStudentId(internshipId, student.getId())) {
            throw new BadRequestException("You have already applied for this internship.");
        }

        // Rule 4: Deterministic Eligibility Engine validation
        com.internflow.modules.eligibility.EligibilityEvaluationResult eligibilityResult =
                eligibilityEngineService.evaluateEligibility(student, internship);
        if (!eligibilityResult.isEligible()) {
            throw new BadRequestException("Ineligible to apply: " + String.join("; ", eligibilityResult.getReasons()));
        }

        // Calculate skill match score
        MatchResultDTO match = matchingEngineService.calculateMatch(student, internship);

        Application application = Application.builder()
                .internship(internship)
                .student(student)
                .currentStatus(ApplicationStatus.APPLIED)
                .coverNote(request != null ? request.getCoverNote() : null)
                .matchScoreAtApplication(match.getMatchScore())
                .build();

        try {
            Application saved = applicationRepository.save(application);

            // Record initial history
            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(saved)
                    .fromStatus(null)
                    .toStatus(ApplicationStatus.APPLIED)
                    .changedByUser(student.getUser())
                    .notes("Candidate submitted application")
                    .build();
            historyRepository.save(history);
            saved.getStatusHistory().add(history);

            // Audit log
            auditService.log("STUDENT_APPLY_INTERNSHIP", "Application", saved.getId(), null, "APPLIED",
                    String.format("Student %s applied to '%s' (Match: %d%%)", student.getFirstName(), internship.getTitle(), match.getMatchScore()));

            // Notify company
            notificationService.createNotification(
                    internship.getCompany().getUser().getId(),
                    "New Application Received! 📄",
                    String.format("%s %s has applied for '%s' (Match Score: %d%%).",
                            student.getFirstName(), student.getLastName(), internship.getTitle(), match.getMatchScore()),
                    NotificationType.INFO,
                    "/company/applicants"
            );

            // Notify student confirmation
            notificationService.createNotification(
                    student.getUser().getId(),
                    "Application Submitted Successfully ✅",
                    String.format("You applied to '%s' at %s.", internship.getTitle(), internship.getCompany().getCompanyName()),
                    NotificationType.SUCCESS,
                    "/student/applications"
            );

            return ApplicationDTO.from(saved);
        } catch (DataIntegrityViolationException ex) {
            // DB Layer unique constraint uk_application_internship_student
            throw new BadRequestException("You have already applied for this internship.");
        }
    }

    @Transactional
    public ApplicationDTO updateStatus(Long applicationId, Long userId, UpdateApplicationStatusRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Ownership authorization check: Company can update their applicants, Admin can update any
        if (!currentUser.getRole().name().equals("ADMIN")) {
            Long companyOwnerUserId = application.getInternship().getCompany().getUser().getId();
            if (!companyOwnerUserId.equals(userId)) {
                throw new ForbiddenException("You do not have permission to manage this application.");
            }
        }

        ApplicationStatus fromStatus = application.getCurrentStatus();
        ApplicationStatus toStatus = request.getTargetStatus();

        // Enforce state machine transition validation
        stateMachine.validateTransition(fromStatus, toStatus);

        application.setCurrentStatus(toStatus);
        Application saved = applicationRepository.save(application);

        // Record history
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(saved)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .changedByUser(currentUser)
                .notes(request.getNotes())
                .build();
        historyRepository.save(history);
        saved.getStatusHistory().add(history);

        // Audit log
        auditService.log("UPDATE_APPLICATION_STATUS", "Application", saved.getId(), fromStatus.name(), toStatus.name(),
                request.getNotes());

        // Notify student of stage update
        String notifTitle = switch (toStatus) {
            case SHORTLISTED -> "You are Shortlisted! 🌟";
            case INTERVIEW_SCHEDULED -> "Interview Stage Reached 📅";
            case SELECTED -> "Congratulations! You've been Selected! 🎉";
            case REJECTED -> "Application Status Update";
            case JOINED -> "Internship Joining Confirmed 🤝";
            case IN_PROGRESS -> "Internship is Now Active 🚀";
            case COMPLETED -> "Internship Verified & Completed! 🎓";
            default -> "Application Update: " + toStatus;
        };

        notificationService.createNotification(
                application.getStudent().getUser().getId(),
                notifTitle,
                String.format("Status for '%s' at %s changed to %s. Notes: %s",
                        application.getInternship().getTitle(),
                        application.getInternship().getCompany().getCompanyName(),
                        toStatus,
                        request.getNotes() != null ? request.getNotes() : "No additional notes"),
                toStatus == ApplicationStatus.SELECTED || toStatus == ApplicationStatus.COMPLETED ? NotificationType.SUCCESS : NotificationType.INFO,
                "/student/applications"
        );

        return ApplicationDTO.from(saved);
    }

    @Transactional
    public void withdrawApplication(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (!application.getStudent().getId().equals(student.getId())) {
            throw new ForbiddenException("You cannot withdraw another student's application");
        }

        // Can only withdraw during early stages
        if (application.getCurrentStatus() != ApplicationStatus.APPLIED &&
                application.getCurrentStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new BadRequestException("Cannot withdraw application once shortlisting or interview scheduling has started.");
        }

        stateMachine.validateTransition(application.getCurrentStatus(), ApplicationStatus.WITHDRAWN);

        ApplicationStatus old = application.getCurrentStatus();
        application.setCurrentStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .fromStatus(old)
                .toStatus(ApplicationStatus.WITHDRAWN)
                .changedByUser(student.getUser())
                .notes("Application voluntarily withdrawn by student")
                .build();
        historyRepository.save(history);

        auditService.log("STUDENT_WITHDRAW_APPLICATION", "Application", application.getId(), old.name(), "WITHDRAWN", null);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getStudentApplications(Long userId, Pageable pageable) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return applicationRepository.findByStudentId(student.getId(), pageable).map(ApplicationDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getCompanyApplications(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return applicationRepository.findByCompanyId(user.getId(), pageable).map(ApplicationDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getInternshipApplications(Long internshipId, Long userId, Pageable pageable) {
        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship", "id", internshipId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.getRole().name().equals("ADMIN") && !internship.getCompany().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied to view applicants for this internship");
        }

        return applicationRepository.findByInternshipId(internshipId, pageable).map(ApplicationDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getAllApplicationsAdmin(ApplicationStatus status, Pageable pageable) {
        if (status != null) {
            return applicationRepository.findByCurrentStatus(status, pageable).map(ApplicationDTO::from);
        }
        return applicationRepository.findAll(pageable).map(ApplicationDTO::from);
    }
}
