package com.internflow.modules.student;

import com.internflow.common.ApiResponse;
import com.internflow.modules.internship.Internship;
import com.internflow.modules.internship.InternshipRepository;
import com.internflow.modules.matching.MatchResultDTO;
import com.internflow.modules.matching.MatchingEngineService;
import com.internflow.modules.matching.SkillGapDTO;
import com.internflow.modules.user.Role;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Endpoints for managing student profiles, skills, and match scoring")
public class StudentController {

    private final StudentService studentService;
    private final MatchingEngineService matchingEngineService;
    private final InternshipRepository internshipRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student's full profile")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentProfileDTO profile = studentService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update current student's personal and academic profile")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> updateMyProfile(@Valid @RequestBody UpdateStudentProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentProfileDTO profile = studentService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", profile));
    }

    @PostMapping("/me/skills")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add or update a skill on the student profile")
    public ResponseEntity<ApiResponse<StudentSkillDTO>> addSkill(@Valid @RequestBody AddSkillRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentSkillDTO skill = studentService.addSkill(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Skill added successfully", skill));
    }

    @DeleteMapping("/me/skills/{skillId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Remove a skill from the student profile")
    public ResponseEntity<ApiResponse<Void>> removeSkill(@PathVariable Long skillId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studentService.removeSkill(userId, skillId);
        return ResponseEntity.ok(ApiResponse.ok("Skill removed successfully", null));
    }

    @PostMapping("/me/projects")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add a project to the student profile")
    public ResponseEntity<ApiResponse<ProjectDTO>> addProject(@Valid @RequestBody ProjectDTO request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectDTO project = studentService.addProject(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Project added successfully", project));
    }

    @DeleteMapping("/me/projects/{projectId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete a project from the student profile")
    public ResponseEntity<ApiResponse<Void>> removeProject(@PathVariable Long projectId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studentService.removeProject(userId, projectId);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }

    @PostMapping("/me/experiences")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add work/internship experience")
    public ResponseEntity<ApiResponse<ExperienceDTO>> addExperience(@Valid @RequestBody ExperienceDTO request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ExperienceDTO experience = studentService.addExperience(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Experience added successfully", experience));
    }

    @DeleteMapping("/me/experiences/{experienceId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete an experience entry")
    public ResponseEntity<ApiResponse<Void>> removeExperience(@PathVariable Long experienceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studentService.removeExperience(userId, experienceId);
        return ResponseEntity.ok(ApiResponse.ok("Experience deleted successfully", null));
    }

    @PostMapping("/me/certifications")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add a certification")
    public ResponseEntity<ApiResponse<CertificationDTO>> addCertification(@Valid @RequestBody CertificationDTO request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CertificationDTO cert = studentService.addCertification(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Certification added successfully", cert));
    }

    @DeleteMapping("/me/certifications/{certId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete a certification")
    public ResponseEntity<ApiResponse<Void>> removeCertification(@PathVariable Long certId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studentService.removeCertification(userId, certId);
        return ResponseEntity.ok(ApiResponse.ok("Certification deleted successfully", null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TPO', 'FACULTY_COORDINATOR', 'ADMIN')")
    @Operation(summary = "Get all student profiles (for staff and coordinators)")
    public ResponseEntity<ApiResponse<List<StudentProfileDTO>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getAllStudents()));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('TPO', 'FACULTY_COORDINATOR', 'ADMIN')")
    @Operation(summary = "Verify or unverify student profile/academic standing")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> verifyStudent(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean verified) {
        StudentProfileDTO profile = studentService.verifyStudent(id, verified);
        return ResponseEntity.ok(ApiResponse.ok("Student verification status updated", profile));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'ADMIN', 'TPO', 'FACULTY_COORDINATOR')")
    @Operation(summary = "View student profile (for recruiters & staff)")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> getStudentById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();
        if (currentUserRole == Role.COMPANY || currentUserRole == Role.RECRUITER) {
            boolean hasApplied = studentService.hasStudentAppliedToCompany(id, currentUserId);
            if (!hasApplied) {
                throw new com.internflow.exception.ForbiddenException("Access denied. Candidate has not applied to your organization.");
            }
        }
        StudentProfileDTO profile = studentService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping("/me/matches/{internshipId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get detailed match score explanation and skill gap analysis for a specific internship")
    public ResponseEntity<ApiResponse<MatchResultDTO>> getMatchDetails(@PathVariable Long internshipId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Student student = studentService.getStudentByUserId(userId);
        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new com.internflow.exception.ResourceNotFoundException("Internship", "id", internshipId));

        MatchResultDTO result = matchingEngineService.calculateMatch(student, internship);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{studentId}/matches/{internshipId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'RECRUITER', 'ADMIN', 'TPO', 'FACULTY_COORDINATOR')")
    @Operation(summary = "Get detailed match score breakdown for a candidate and internship")
    public ResponseEntity<ApiResponse<MatchResultDTO>> getCandidateMatch(
            @PathVariable Long studentId,
            @PathVariable Long internshipId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new com.internflow.exception.ResourceNotFoundException("Internship", "id", internshipId));

        if (currentUserRole == Role.COMPANY || currentUserRole == Role.RECRUITER) {
            if (!internship.getCompany().getUser().getId().equals(currentUserId)) {
                throw new com.internflow.exception.ForbiddenException("Access denied. You do not own this internship posting.");
            }
        }

        Student student = studentService.getStudentEntityById(studentId);
        MatchResultDTO result = matchingEngineService.calculateMatch(student, internship);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/me/skill-gap/{internshipId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get skill gap analysis and recommendations for an internship")
    public ResponseEntity<ApiResponse<SkillGapDTO>> getSkillGap(@PathVariable Long internshipId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Student student = studentService.getStudentByUserId(userId);
        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new com.internflow.exception.ResourceNotFoundException("Internship", "id", internshipId));

        SkillGapDTO result = matchingEngineService.analyzeSkillGap(student, internship);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
