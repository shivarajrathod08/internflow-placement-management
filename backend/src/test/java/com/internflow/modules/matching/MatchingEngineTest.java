package com.internflow.modules.matching;

import com.internflow.modules.company.Company;
import com.internflow.modules.internship.Internship;
import com.internflow.modules.internship.InternshipSkill;
import com.internflow.modules.internship.WorkMode;
import com.internflow.modules.skill.Skill;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentProject;
import com.internflow.modules.student.StudentSkill;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MatchingEngineTest {

    private MatchingEngineService matchingEngineService;

    @BeforeEach
    void setUp() {
        matchingEngineService = new MatchingEngineService();
    }

    @Test
    @DisplayName("Should produce high match score when student possesses all required and preferred skills and meets CGPA")
    void testPerfectMatch() {
        Skill java = Skill.builder().id(1L).canonicalName("Java").category("Backend").build();
        Skill spring = Skill.builder().id(2L).canonicalName("Spring Boot").category("Backend").build();
        Skill docker = Skill.builder().id(3L).canonicalName("Docker").category("DevOps").build();

        Company google = Company.builder().companyName("Google LLC").build();

        Internship internship = Internship.builder()
                .id(100L)
                .company(google)
                .title("Backend Engineer Intern")
                .minCgpa(BigDecimal.valueOf(7.5))
                .allowedBranches("Computer Science, IT")
                .graduationYear(2026)
                .applicationDeadline(LocalDateTime.now().plusMonths(2))
                .workMode(WorkMode.HYBRID)
                .skills(new ArrayList<>())
                .build();

        internship.getSkills().add(InternshipSkill.builder().internship(internship).skill(java).required(true).build());
        internship.getSkills().add(InternshipSkill.builder().internship(internship).skill(spring).required(true).build());
        internship.getSkills().add(InternshipSkill.builder().internship(internship).skill(docker).required(false).build());

        Student student = Student.builder()
                .id(50L)
                .firstName("Alex")
                .lastName("Rivera")
                .branch("Computer Science")
                .cgpa(BigDecimal.valueOf(8.5))
                .graduationYear(2026)
                .resumeUrl("https://storage/resume.pdf")
                .bio("Backend engineer")
                .skills(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();

        student.getSkills().add(StudentSkill.builder().student(student).skill(java).proficiencyLevel("ADVANCED").build());
        student.getSkills().add(StudentSkill.builder().student(student).skill(spring).proficiencyLevel("ADVANCED").build());
        student.getSkills().add(StudentSkill.builder().student(student).skill(docker).proficiencyLevel("INTERMEDIATE").build());

        student.getProjects().add(StudentProject.builder().title("Cloud Microservices in Java & Spring Boot").techStack("Java, Spring Boot").build());

        MatchResultDTO result = matchingEngineService.calculateMatch(student, internship);

        assertTrue(result.isEligible(), "Student should be eligible");
        assertTrue(result.getMatchScore() >= 85, "Match score should be >= 85% for high match, was: " + result.getMatchScore());
        assertEquals(2, result.getMatchedRequiredSkills().size());
        assertEquals(1, result.getMatchedPreferredSkills().size());
        assertTrue(result.getMissingRequiredSkills().isEmpty(), "No required skills should be missing");
    }

    @Test
    @DisplayName("Should flag student as ineligible if CGPA falls below minimum cutoff")
    void testIneligibleDueToCgpa() {
        Company msft = Company.builder().companyName("Microsoft").build();

        Internship internship = Internship.builder()
                .company(msft)
                .title("AI Intern")
                .minCgpa(BigDecimal.valueOf(8.0))
                .allowedBranches("All Branches")
                .skills(new ArrayList<>())
                .build();

        Student student = Student.builder()
                .firstName("John")
                .lastName("Doe")
                .branch("Computer Science")
                .cgpa(BigDecimal.valueOf(6.8)) // Below 8.0
                .skills(new ArrayList<>())
                .build();

        MatchResultDTO result = matchingEngineService.calculateMatch(student, internship);

        assertFalse(result.isEligible(), "Student with 6.8 CGPA should fail 8.0 minimum cutoff");
        assertTrue(result.getEligibilityNotes().stream().anyMatch(n -> n.contains("CGPA below required minimum")));
    }

    @Test
    @DisplayName("Should detect missing skill gaps correctly and recommend target skills")
    void testSkillGapAnalysis() {
        Skill python = Skill.builder().id(10L).canonicalName("Python").category("Backend").build();
        Skill pytorch = Skill.builder().id(11L).canonicalName("PyTorch").category("AI/ML").build();
        Skill kafka = Skill.builder().id(12L).canonicalName("Apache Kafka").category("Database").build();

        Company startup = Company.builder().companyName("AI Labs").build();

        Internship internship = Internship.builder()
                .company(startup)
                .title("ML Platform Intern")
                .minCgpa(BigDecimal.valueOf(7.0))
                .skills(List.of(
                        InternshipSkill.builder().skill(python).required(true).build(),
                        InternshipSkill.builder().skill(pytorch).required(true).build(),
                        InternshipSkill.builder().skill(kafka).required(false).build()
                ))
                .build();

        // Student only knows Python
        Student student = Student.builder()
                .firstName("Sara")
                .cgpa(BigDecimal.valueOf(8.0))
                .branch("Computer Science")
                .skills(List.of(
                        StudentSkill.builder().skill(python).proficiencyLevel("INTERMEDIATE").build()
                ))
                .build();

        SkillGapDTO gap = matchingEngineService.analyzeSkillGap(student, internship);

        assertTrue(gap.getMissingRequiredSkills().contains("PyTorch"), "Missing required skills must include PyTorch");
        assertTrue(gap.getMissingPreferredSkills().contains("Apache Kafka"), "Missing preferred skills must include Apache Kafka");
        assertFalse(gap.getRecommendations().isEmpty(), "Recommendations should be provided to bridge the skill gap");
    }
}
