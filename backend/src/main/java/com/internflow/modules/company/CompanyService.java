package com.internflow.modules.company;

import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.notification.NotificationService;
import com.internflow.modules.notification.NotificationType;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Company getCompanyByUserId(Long userId) {
        return companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found for user ID: " + userId));
    }

    @Transactional(readOnly = true)
    public CompanyProfileDTO getProfileByUserId(Long userId) {
        Company company = getCompanyByUserId(userId);
        return CompanyProfileDTO.from(company);
    }

    @Transactional(readOnly = true)
    public CompanyProfileDTO getProfileById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
        return CompanyProfileDTO.from(company);
    }

    @Transactional
    public CompanyProfileDTO updateProfile(Long userId, UpdateCompanyProfileRequest request) {
        Company company = getCompanyByUserId(userId);

        company.setCompanyName(request.getCompanyName());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setLogoUrl(request.getLogoUrl());

        Company updated = companyRepository.save(company);
        auditService.log("UPDATE_COMPANY_PROFILE", "Company", updated.getId(), null, null, "Updated company details");

        return CompanyProfileDTO.from(updated);
    }

    @Transactional
    public CompanyProfileDTO verifyCompany(Long companyId, VerifyCompanyRequest request, Long adminId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin User", "id", adminId));

        CompanyVerificationStatus oldStatus = company.getVerificationStatus();
        company.setVerificationStatus(request.getStatus());
        company.setRejectionReason(request.getRejectionReason());
        company.setVerifiedByAdmin(admin);
        company.setVerifiedAt(LocalDateTime.now());

        Company saved = companyRepository.save(company);

        // Audit log
        auditService.log(
                "ADMIN_VERIFY_COMPANY",
                "Company",
                saved.getId(),
                oldStatus.name(),
                request.getStatus().name(),
                request.getStatus() == CompanyVerificationStatus.APPROVED
                        ? "Company successfully verified and approved."
                        : "Reason: " + request.getRejectionReason()
        );

        // Notify company user
        String title = request.getStatus() == CompanyVerificationStatus.APPROVED
                ? "Company Profile Approved! ✅"
                : "Company Verification Update: " + request.getStatus();
        String message = request.getStatus() == CompanyVerificationStatus.APPROVED
                ? "Your company profile has been verified by the college administrator. You can now post internships."
                : "Your verification request status changed to " + request.getStatus() + ". Reason: " + request.getRejectionReason();

        notificationService.createNotification(
                company.getUser().getId(),
                title,
                message,
                request.getStatus() == CompanyVerificationStatus.APPROVED ? NotificationType.SUCCESS : NotificationType.WARNING,
                "/company/dashboard"
        );

        return CompanyProfileDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<CompanyProfileDTO> getCompaniesByStatus(CompanyVerificationStatus status, Pageable pageable) {
        return companyRepository.findByVerificationStatus(status, pageable)
                .map(CompanyProfileDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<CompanyProfileDTO> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable)
                .map(CompanyProfileDTO::from);
    }
}
