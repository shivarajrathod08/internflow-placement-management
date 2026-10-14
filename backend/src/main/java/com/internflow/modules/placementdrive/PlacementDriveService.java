package com.internflow.modules.placementdrive;

import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.company.Company;
import com.internflow.modules.company.CompanyRepository;
import com.internflow.modules.internship.Internship;
import com.internflow.modules.internship.InternshipRepository;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentProfileDTO;
import com.internflow.modules.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlacementDriveService {

    private final PlacementDriveRepository driveRepository;
    private final CompanyRepository companyRepository;
    private final InternshipRepository internshipRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<PlacementDriveDTO> getAllDrives(Pageable pageable) {
        return driveRepository.findAllByOrderByDriveDateAsc(pageable).map(PlacementDriveDTO::from);
    }

    @Transactional(readOnly = true)
    public PlacementDriveDTO getDriveById(Long id) {
        PlacementDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", id));
        return PlacementDriveDTO.from(drive);
    }

    @Transactional
    public PlacementDriveDTO createDrive(CreatePlacementDriveRequest request, Long userId) {
        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));
        }

        Internship internship = null;
        if (request.getInternshipId() != null) {
            internship = internshipRepository.findById(request.getInternshipId())
                    .orElseThrow(() -> new ResourceNotFoundException("Internship", "id", request.getInternshipId()));
        }

        PlacementDrive drive = PlacementDrive.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .academicYear(request.getAcademicYear())
                .company(company)
                .internship(internship)
                .driveDate(request.getDriveDate())
                .registrationDeadline(request.getRegistrationDeadline())
                .venueOrLink(request.getVenueOrLink())
                .status(PlacementDriveStatus.UPCOMING)
                .eligibleBranches(request.getEligibleBranches())
                .minCgpa(request.getMinCgpa() != null ? request.getMinCgpa() : BigDecimal.ZERO)
                .rulesSummary(request.getRulesSummary())
                .build();

        PlacementDrive saved = driveRepository.save(drive);
        auditService.log("CREATE_PLACEMENT_DRIVE", "PlacementDrive", saved.getId(), null, null, "Scheduled placement drive: " + saved.getTitle());
        return PlacementDriveDTO.from(saved);
    }

    @Transactional
    public PlacementDriveDTO updateStatus(Long id, PlacementDriveStatus newStatus, Long userId) {
        PlacementDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", id));
        PlacementDriveStatus old = drive.getStatus();
        drive.setStatus(newStatus);
        PlacementDrive saved = driveRepository.save(drive);
        auditService.log("UPDATE_DRIVE_STATUS", "PlacementDrive", saved.getId(), old.name(), newStatus.name(), "Updated drive status");
        return PlacementDriveDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentProfileDTO> getEligibleCandidates(Long driveId) {
        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", driveId));

        List<String> allowedBranches = drive.getEligibleBranches() != null && !drive.getEligibleBranches().isBlank()
                ? Arrays.stream(drive.getEligibleBranches().split(",")).map(String::trim).map(String::toLowerCase).toList()
                : List.of();

        List<Student> allStudents = studentRepository.findAll();
        return allStudents.stream()
                .filter(s -> {
                    // Check CGPA
                    if (drive.getMinCgpa() != null && drive.getMinCgpa().compareTo(BigDecimal.ZERO) > 0) {
                        if (s.getCgpa() == null || s.getCgpa().compareTo(drive.getMinCgpa()) < 0) {
                            return false;
                        }
                    }
                    // Check Branch
                    if (!allowedBranches.isEmpty()) {
                        if (s.getBranch() == null || !allowedBranches.contains(s.getBranch().trim().toLowerCase())) {
                            return false;
                        }
                    }
                    // Must have 0 active backlogs by default for campus drives
                    if (s.getActiveBacklogs() != null && s.getActiveBacklogs() > 0) {
                        return false;
                    }
                    return true;
                })
                .map(StudentProfileDTO::from)
                .toList();
    }
}
