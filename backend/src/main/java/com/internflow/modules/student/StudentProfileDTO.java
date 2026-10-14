package com.internflow.modules.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String college;
    private String degree;
    private String branch;
    private String rollNumber;
    private Integer activeBacklogs;
    private Integer totalBacklogs;
    private Boolean isVerified;
    private Integer graduationYear;
    private BigDecimal cgpa;
    private String bio;
    private String resumeUrl;
    private String profilePicUrl;
    private int profileCompletionPercentage;

    private List<StudentSkillDTO> skills;
    private List<ProjectDTO> projects;
    private List<ExperienceDTO> experiences;
    private List<CertificationDTO> certifications;

    public static StudentProfileDTO from(Student s) {
        int completion = calculateCompletion(s);

        List<StudentSkillDTO> skillDTOs = s.getSkills() != null
                ? s.getSkills().stream().map(StudentSkillDTO::from).toList()
                : List.of();

        List<ProjectDTO> projectDTOs = s.getProjects() != null
                ? s.getProjects().stream().map(ProjectDTO::from).toList()
                : List.of();

        List<ExperienceDTO> experienceDTOs = s.getExperiences() != null
                ? s.getExperiences().stream().map(ExperienceDTO::from).toList()
                : List.of();

        List<CertificationDTO> certificationDTOs = s.getCertifications() != null
                ? s.getCertifications().stream().map(CertificationDTO::from).toList()
                : List.of();

        return StudentProfileDTO.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .email(s.getUser().getEmail())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .phone(s.getPhone())
                .college(s.getCollege())
                .degree(s.getDegree())
                .branch(s.getBranch())
                .rollNumber(s.getRollNumber())
                .activeBacklogs(s.getActiveBacklogs() != null ? s.getActiveBacklogs() : 0)
                .totalBacklogs(s.getTotalBacklogs() != null ? s.getTotalBacklogs() : 0)
                .isVerified(s.getIsVerified() != null ? s.getIsVerified() : false)
                .graduationYear(s.getGraduationYear())
                .cgpa(s.getCgpa())
                .bio(s.getBio())
                .resumeUrl(s.getResumeUrl())
                .profilePicUrl(s.getProfilePicUrl())
                .profileCompletionPercentage(completion)
                .skills(skillDTOs)
                .projects(projectDTOs)
                .experiences(experienceDTOs)
                .certifications(certificationDTOs)
                .build();
    }

    private static int calculateCompletion(Student s) {
        int score = 20; // user account registered
        if (s.getPhone() != null && !s.getPhone().isBlank()) score += 10;
        if (s.getCollege() != null && s.getBranch() != null) score += 20;
        if (s.getCgpa() != null) score += 10;
        if (s.getBio() != null && !s.getBio().isBlank()) score += 10;
        if (s.getSkills() != null && !s.getSkills().isEmpty()) score += 15;
        if (s.getProjects() != null && !s.getProjects().isEmpty()) score += 10;
        if (s.getResumeUrl() != null && !s.getResumeUrl().isBlank()) score += 5;
        return Math.min(100, score);
    }
}
