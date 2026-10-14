package com.internflow.modules.student;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.skill.Skill;
import com.internflow.modules.skill.SkillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentExperienceRepository studentExperienceRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final SkillService skillService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public StudentProfileDTO getProfileByUserId(Long userId) {
        Student student = getStudentByUserId(userId);
        return StudentProfileDTO.from(student);
    }

    @Transactional(readOnly = true)
    public StudentProfileDTO getProfileById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return StudentProfileDTO.from(student);
    }

    @Transactional(readOnly = true)
    public Student getStudentEntityById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
    }

    @Transactional
    public StudentProfileDTO updateProfile(Long userId, UpdateStudentProfileRequest request) {
        Student student = getStudentByUserId(userId);

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setPhone(request.getPhone());
        student.setCollege(request.getCollege());
        student.setDegree(request.getDegree());
        student.setBranch(request.getBranch());
        if (request.getRollNumber() != null) {
            student.setRollNumber(request.getRollNumber());
        }
        if (request.getActiveBacklogs() != null) {
            student.setActiveBacklogs(request.getActiveBacklogs());
        }
        if (request.getTotalBacklogs() != null) {
            student.setTotalBacklogs(request.getTotalBacklogs());
        }
        student.setGraduationYear(request.getGraduationYear());
        student.setCgpa(request.getCgpa());
        student.setBio(request.getBio());

        Student updated = studentRepository.save(student);
        auditService.log("UPDATE_STUDENT_PROFILE", "Student", updated.getId(), null, null, "Updated personal and academic profile");

        return StudentProfileDTO.from(updated);
    }

    @Transactional
    public StudentProfileDTO verifyStudent(Long studentId, boolean verified) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        student.setIsVerified(verified);
        Student saved = studentRepository.save(student);
        auditService.log("VERIFY_STUDENT_PROFILE", "Student", saved.getId(), null, String.valueOf(verified), "TPO/Coordinator verified student academic records");
        return StudentProfileDTO.from(saved);
    }

    @Transactional
    public StudentSkillDTO addSkill(Long userId, AddSkillRequest request) {
        Student student = getStudentByUserId(userId);
        Skill skill = skillService.resolveSkill(request.getSkillName());

        Optional<StudentSkill> existing = studentSkillRepository.findByStudentIdAndSkillId(student.getId(), skill.getId());
        if (existing.isPresent()) {
            StudentSkill ss = existing.get();
            if (request.getProficiencyLevel() != null) {
                ss.setProficiencyLevel(request.getProficiencyLevel());
            }
            if (request.getYearsExperience() != null) {
                ss.setYearsExperience(request.getYearsExperience());
            }
            return StudentSkillDTO.from(studentSkillRepository.save(ss));
        }

        StudentSkill studentSkill = StudentSkill.builder()
                .student(student)
                .skill(skill)
                .proficiencyLevel(request.getProficiencyLevel() != null ? request.getProficiencyLevel() : "INTERMEDIATE")
                .yearsExperience(request.getYearsExperience() != null ? request.getYearsExperience() : BigDecimal.valueOf(1.0))
                .build();

        StudentSkill saved = studentSkillRepository.save(studentSkill);
        return StudentSkillDTO.from(saved);
    }

    @Transactional
    public void removeSkill(Long userId, Long skillId) {
        Student student = getStudentByUserId(userId);
        studentSkillRepository.deleteByStudentIdAndSkillId(student.getId(), skillId);
    }

    @Transactional
    public ProjectDTO addProject(Long userId, ProjectDTO dto) {
        Student student = getStudentByUserId(userId);
        StudentProject project = StudentProject.builder()
                .student(student)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .techStack(dto.getTechStack())
                .githubUrl(dto.getGithubUrl())
                .liveUrl(dto.getLiveUrl())
                .build();

        StudentProject saved = studentProjectRepository.save(project);
        return ProjectDTO.from(saved);
    }

    @Transactional
    public void removeProject(Long userId, Long projectId) {
        Student student = getStudentByUserId(userId);
        StudentProject project = studentProjectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (!project.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("You do not own this project entry");
        }
        studentProjectRepository.delete(project);
    }

    @Transactional
    public ExperienceDTO addExperience(Long userId, ExperienceDTO dto) {
        Student student = getStudentByUserId(userId);
        StudentExperience experience = StudentExperience.builder()
                .student(student)
                .organizationName(dto.getOrganizationName())
                .role(dto.getRole())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .current(dto.isCurrent())
                .description(dto.getDescription())
                .build();

        StudentExperience saved = studentExperienceRepository.save(experience);
        return ExperienceDTO.from(saved);
    }

    @Transactional
    public void removeExperience(Long userId, Long expId) {
        Student student = getStudentByUserId(userId);
        StudentExperience exp = studentExperienceRepository.findById(expId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", "id", expId));

        if (!exp.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("You do not own this experience entry");
        }
        studentExperienceRepository.delete(exp);
    }

    @Transactional
    public CertificationDTO addCertification(Long userId, CertificationDTO dto) {
        Student student = getStudentByUserId(userId);
        StudentCertification cert = StudentCertification.builder()
                .student(student)
                .name(dto.getName())
                .issuingOrg(dto.getIssuingOrg())
                .issueDate(dto.getIssueDate())
                .credentialUrl(dto.getCredentialUrl())
                .build();

        StudentCertification saved = studentCertificationRepository.save(cert);
        return CertificationDTO.from(saved);
    }

    @Transactional
    public void removeCertification(Long userId, Long certId) {
        Student student = getStudentByUserId(userId);
        StudentCertification cert = studentCertificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification", "id", certId));

        if (!cert.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("You do not own this certification entry");
        }
        studentCertificationRepository.delete(cert);
    }

    @Transactional(readOnly = true)
    public List<StudentProfileDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(StudentProfileDTO::from)
                .toList();
    }

    @Transactional
    public void updateResumeUrl(Long userId, String resumeUrl) {
        Student student = getStudentByUserId(userId);
        student.setResumeUrl(resumeUrl);
        studentRepository.save(student);
    }
}
