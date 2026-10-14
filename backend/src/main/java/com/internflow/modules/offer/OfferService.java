package com.internflow.modules.offer;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ForbiddenException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.application.Application;
import com.internflow.modules.application.ApplicationRepository;
import com.internflow.modules.application.ApplicationStatus;
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
public class OfferService {

    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public OfferDTO createOffer(CreateOfferRequest request, Long userId) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (currentUser.getRole() == Role.COMPANY) {
            Long ownerUserId = application.getInternship().getCompany().getUser().getId();
            if (!ownerUserId.equals(userId)) {
                throw new ForbiddenException("You cannot issue offers on behalf of another company");
            }
        }

        if (offerRepository.existsByApplicationId(request.getApplicationId())) {
            throw new BadRequestException("An offer has already been issued for this application.");
        }

        Offer offer = Offer.builder()
                .application(application)
                .student(application.getStudent())
                .company(application.getInternship().getCompany())
                .internship(application.getInternship())
                .designation(request.getDesignation())
                .ctcOrStipend(request.getCtcOrStipend())
                .offerLetterUrl(request.getOfferLetterUrl())
                .joiningDate(request.getJoiningDate())
                .offerDate(LocalDateTime.now())
                .status(OfferStatus.OFFERED)
                .build();

        Offer saved = offerRepository.save(offer);

        // Update application status to OFFERED
        application.setCurrentStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        // Notify Student
        notificationService.createNotification(
                application.getStudent().getUser().getId(),
                "Congratulations! Job Offer Received",
                "You have received a formal offer from " + offer.getCompany().getCompanyName() +
                        " for the position of " + offer.getDesignation() + ".",
                NotificationType.SUCCESS,
                "/student/offers"
        );

        auditService.log("CREATE_OFFER", "Offer", saved.getId(), null, null,
                "Issued offer to student ID: " + application.getStudent().getId() + " by company ID: " + offer.getCompany().getId());

        return OfferDTO.from(saved);
    }

    @Transactional
    public OfferDTO updateOfferStatus(Long offerId, UpdateOfferStatusRequest request, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        OfferStatus oldStatus = offer.getStatus();
        OfferStatus newStatus = request.getStatus();

        // Enforce role-based actions and state transitions
        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + userId));
            if (!offer.getStudent().getId().equals(student.getId())) {
                throw new ForbiddenException("You cannot accept or decline another candidate's offer.");
            }
            if (oldStatus != OfferStatus.OFFERED) {
                throw new BadRequestException("Offer cannot be responded to in state: " + oldStatus);
            }
            if (newStatus != OfferStatus.ACCEPTED && newStatus != OfferStatus.DECLINED) {
                throw new BadRequestException("Students may only ACCEPT or DECLINE an offer.");
            }
        } else if (user.getRole() == Role.COMPANY) {
            Long companyOwnerId = offer.getCompany().getUser().getId();
            if (!companyOwnerId.equals(userId)) {
                throw new ForbiddenException("You can only manage offers for your own company.");
            }
            if (newStatus == OfferStatus.REVOKED) {
                if (oldStatus != OfferStatus.OFFERED && oldStatus != OfferStatus.ACCEPTED) {
                    throw new BadRequestException("Only OFFERED or ACCEPTED offers can be revoked.");
                }
            } else if (newStatus == OfferStatus.JOINED) {
                if (oldStatus != OfferStatus.ACCEPTED) {
                    throw new BadRequestException("Only an ACCEPTED offer can be marked as JOINED.");
                }
            } else {
                throw new BadRequestException("Companies can only mark offers as REVOKED or JOINED.");
            }
        }

        offer.setStatus(newStatus);
        offer.setResponseNotes(request.getResponseNotes());

        Offer saved = offerRepository.save(offer);

        // Update application status
        if (newStatus == OfferStatus.ACCEPTED) {
            offer.getApplication().setCurrentStatus(ApplicationStatus.ACCEPTED);
            applicationRepository.save(offer.getApplication());

            // Notify Recruiter
            notificationService.createNotification(
                    offer.getCompany().getUser().getId(),
                    "Offer Accepted!",
                    offer.getStudent().getFirstName() + " " + offer.getStudent().getLastName() +
                            " accepted the offer for " + offer.getDesignation() + ".",
                    NotificationType.SUCCESS,
                    "/company/applicants"
            );
        } else if (newStatus == OfferStatus.DECLINED) {
            notificationService.createNotification(
                    offer.getCompany().getUser().getId(),
                    "Offer Declined",
                    offer.getStudent().getFirstName() + " " + offer.getStudent().getLastName() +
                            " declined the offer for " + offer.getDesignation() + ".",
                    NotificationType.INFO,
                    "/company/applicants"
            );
        } else if (newStatus == OfferStatus.JOINED) {
            offer.getApplication().setCurrentStatus(ApplicationStatus.IN_PROGRESS);
            applicationRepository.save(offer.getApplication());
        }

        auditService.log("UPDATE_OFFER_STATUS", "Offer", saved.getId(), oldStatus.name(), newStatus.name(),
                "Updated offer status: " + newStatus);

        return OfferDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersForStudent(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return offerRepository.findByStudentIdOrderByOfferDateDesc(student.getId())
                .stream()
                .map(OfferDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersForCompany(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));
        return offerRepository.findByCompanyIdOrderByOfferDateDesc(company.getId())
                .stream()
                .map(OfferDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersByCompanyEntityId(Long companyId) {
        return offerRepository.findByCompanyIdOrderByOfferDateDesc(companyId)
                .stream()
                .map(OfferDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<OfferDTO> getAllOffers(Pageable pageable) {
        return offerRepository.findAllByOrderByOfferDateDesc(pageable).map(OfferDTO::from);
    }
}
