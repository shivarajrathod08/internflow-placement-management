package com.internflow.modules.internship;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ForbiddenException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.company.Company;
import com.internflow.modules.company.CompanyRepository;
import com.internflow.modules.company.CompanyVerificationStatus;
import com.internflow.modules.notification.NotificationService;
import com.internflow.modules.notification.NotificationType;
import com.internflow.modules.skill.Skill;
import com.internflow.modules.skill.SkillService;
import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InternshipService {

    private final InternshipRepository internshipRepository;
    private final InternshipSkillRepository internshipSkillRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final SkillService skillService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Internship getInternshipEntity(Long id) {
        return internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship", "id", id));
    }

    @Transactional(readOnly = true)
    public InternshipDTO getInternshipById(Long id) {
        return InternshipDTO.from(getInternshipEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<InternshipDTO> searchPublishedInternships(InternshipFilterRequest filter, Pageable pageable) {
        Specification<Internship> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only published postings visible to public / students
            predicates.add(cb.equal(root.get("status"), InternshipStatus.PUBLISHED));

            // Deadline must be in the future
            predicates.add(cb.greaterThan(root.get("applicationDeadline"), LocalDateTime.now()));

            if (filter.getQuery() != null && !filter.getQuery().isBlank()) {
                String term = "%" + filter.getQuery().trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                Predicate compMatch = cb.like(cb.lower(root.get("company").get("companyName")), term);
                predicates.add(cb.or(titleMatch, descMatch, compMatch));
            }

            if (filter.getLocation() != null && !filter.getLocation().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + filter.getLocation().trim().toLowerCase() + "%"));
            }

            if (filter.getWorkMode() != null) {
                predicates.add(cb.equal(root.get("workMode"), filter.getWorkMode()));
            }

            if (filter.getMinStipend() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("stipendPerMonth"), filter.getMinStipend()));
            }

            if (filter.getSkill() != null && !filter.getSkill().isBlank()) {
                Join<Internship, InternshipSkill> skillJoin = root.join("skills");
                predicates.add(cb.like(cb.lower(skillJoin.get("skill").get("canonicalName")),
                        "%" + filter.getSkill().trim().toLowerCase() + "%"));
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return internshipRepository.findAll(spec, pageable).map(InternshipDTO::from);
    }

    @Transactional
    public InternshipDTO createInternship(Long userId, CreateInternshipRequest request) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for user ID: " + userId));

        // Rule 1: Unverified or suspended companies cannot post internships
        if (company.getVerificationStatus() != CompanyVerificationStatus.APPROVED) {
            throw new ForbiddenException("Your company profile must be approved by an administrator before posting internships. Current status: " + company.getVerificationStatus());
        }

        Internship internship = Internship.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .workMode(request.getWorkMode())
                .durationMonths(request.getDurationMonths())
                .stipendPerMonth(request.getStipendPerMonth())
                .minCgpa(request.getMinCgpa())
                .maxBacklogs(request.getMaxBacklogs())
                .allowedBranches(request.getAllowedBranches())
                .graduationYear(request.getGraduationYear())
                .applicationDeadline(request.getApplicationDeadline())
                .openings(request.getOpenings())
                .status(InternshipStatus.PENDING_APPROVAL) // Submitted for admin review
                .build();

        Internship saved = internshipRepository.save(internship);

        // Associate skills
        attachSkills(saved, request.getRequiredSkills(), true);
        attachSkills(saved, request.getPreferredSkills(), false);

        auditService.log("CREATE_INTERNSHIP", "Internship", saved.getId(), null, "PENDING_APPROVAL",
                "Company created internship posting awaiting admin approval");

        return InternshipDTO.from(saved);
    }

    @Transactional
    public InternshipDTO approveOrRejectInternship(Long internshipId, ApproveInternshipRequest request, Long adminId) {
        Internship internship = getInternshipEntity(internshipId);
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", adminId));

        InternshipStatus oldStatus = internship.getStatus();
        if (request.getApproved()) {
            internship.setStatus(InternshipStatus.PUBLISHED);
            internship.setApprovedByAdmin(admin);
            internship.setApprovedAt(LocalDateTime.now());
            internship.setRejectionReason(null);
        } else {
            internship.setStatus(InternshipStatus.ARCHIVED);
            internship.setRejectionReason(request.getRejectionReason());
        }

        Internship saved = internshipRepository.save(internship);

        auditService.log(
                request.getApproved() ? "ADMIN_APPROVE_INTERNSHIP" : "ADMIN_REJECT_INTERNSHIP",
                "Internship",
                saved.getId(),
                oldStatus.name(),
                saved.getStatus().name(),
                request.getApproved() ? "Approved and published" : "Rejected: " + request.getRejectionReason()
        );

        // Notify company
        notificationService.createNotification(
                internship.getCompany().getUser().getId(),
                request.getApproved() ? "Internship Approved & Published! 🚀" : "Internship Posting Update",
                request.getApproved()
                        ? String.format("Your internship '%s' has been approved and is now live for students.", internship.getTitle())
                        : String.format("Your internship '%s' was rejected. Reason: %s", internship.getTitle(), request.getRejectionReason()),
                request.getApproved() ? NotificationType.SUCCESS : NotificationType.WARNING,
                "/company/internships"
        );

        return InternshipDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<InternshipDTO> getCompanyInternships(Long userId, Pageable pageable) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for user ID: " + userId));
        return internshipRepository.findByCompanyId(company.getId(), pageable).map(InternshipDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<InternshipDTO> getPendingInternships(Pageable pageable) {
        return internshipRepository.findByStatus(InternshipStatus.PENDING_APPROVAL, pageable).map(InternshipDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<InternshipDTO> getAllInternshipsAdmin(Pageable pageable) {
        return internshipRepository.findAll(pageable).map(InternshipDTO::from);
    }

    @Transactional
    public void closeInternship(Long internshipId, Long userId) {
        Internship internship = getInternshipEntity(internshipId);
        verifyCompanyOwnership(internship, userId);

        internship.setStatus(InternshipStatus.CLOSED);
        internshipRepository.save(internship);
        auditService.log("CLOSE_INTERNSHIP", "Internship", internship.getId(), null, "CLOSED", "Internship closed by company");
    }

    private void verifyCompanyOwnership(Internship internship, Long userId) {
        if (!internship.getCompany().getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to modify this internship posting");
        }
    }

    private void attachSkills(Internship internship, List<String> skillNames, boolean isRequired) {
        if (skillNames == null || skillNames.isEmpty()) return;

        for (String skillName : skillNames) {
            if (skillName.isBlank()) continue;
            Skill skill = skillService.resolveSkill(skillName.trim());
            InternshipSkill is = InternshipSkill.builder()
                    .internship(internship)
                    .skill(skill)
                    .required(isRequired)
                    .build();
            internshipSkillRepository.save(is);
            internship.getSkills().add(is);
        }
    }
}
