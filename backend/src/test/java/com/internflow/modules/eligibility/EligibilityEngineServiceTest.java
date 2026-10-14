package com.internflow.modules.eligibility;

import com.internflow.modules.internship.Internship;
import com.internflow.modules.student.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Deterministic Eligibility Engine Service Tests")
class EligibilityEngineServiceTest {

    private EligibilityEngineService engineService;

    @BeforeEach
    void setUp() {
        engineService = new EligibilityEngineService();
    }

    @Test
    @DisplayName("Student meeting all branch, CGPA, backlog, and grad year criteria is ELIGIBLE")
    void testEligibleStudentPasses() {
        Student student = Student.builder()
                .id(1L)
                .branch("Computer Science")
                .cgpa(new BigDecimal("8.50"))
                .activeBacklogs(0)
                .graduationYear(2026)
                .isVerified(true)
                .build();

        Internship internship = Internship.builder()
                .id(10L)
                .allowedBranches("Computer Science, Information Technology")
                .minCgpa(new BigDecimal("7.50"))
                .maxBacklogs(0)
                .graduationYear(2026)
                .build();

        EligibilityEvaluationResult result = engineService.evaluateEligibility(student, internship);

        assertTrue(result.isEligible(), "Student should be eligible");
        assertEquals(EligibilityStatus.ELIGIBLE, result.getStatus());
        assertTrue(result.getReasons().isEmpty(), "No rejection reasons should be present");
    }

    @Test
    @DisplayName("Student with CGPA below minimum threshold is INELIGIBLE with clear explanation")
    void testLowCgpaFails() {
        Student student = Student.builder()
                .id(2L)
                .branch("Computer Science")
                .cgpa(new BigDecimal("6.80"))
                .activeBacklogs(0)
                .graduationYear(2026)
                .isVerified(true)
                .build();

        Internship internship = Internship.builder()
                .id(11L)
                .allowedBranches("Computer Science")
                .minCgpa(new BigDecimal("7.50"))
                .maxBacklogs(0)
                .graduationYear(2026)
                .build();

        EligibilityEvaluationResult result = engineService.evaluateEligibility(student, internship);

        assertFalse(result.isEligible());
        assertEquals(EligibilityStatus.INELIGIBLE, result.getStatus());
        assertEquals(1, result.getReasons().size());
        assertTrue(result.getReasons().get(0).contains("Minimum CGPA required is 7.50, but your current CGPA is 6.80"));
    }

    @Test
    @DisplayName("Student with disallowed branch is INELIGIBLE")
    void testDisallowedBranchFails() {
        Student student = Student.builder()
                .id(3L)
                .branch("Civil Engineering")
                .cgpa(new BigDecimal("9.00"))
                .activeBacklogs(0)
                .graduationYear(2026)
                .isVerified(true)
                .build();

        Internship internship = Internship.builder()
                .id(12L)
                .allowedBranches("Computer Science, Information Technology, Electronics")
                .minCgpa(new BigDecimal("8.00"))
                .maxBacklogs(0)
                .graduationYear(2026)
                .build();

        EligibilityEvaluationResult result = engineService.evaluateEligibility(student, internship);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().get(0).contains("Civil Engineering"));
    }

    @Test
    @DisplayName("Student with active backlogs exceeding opportunity policy is INELIGIBLE")
    void testActiveBacklogsFails() {
        Student student = Student.builder()
                .id(4L)
                .branch("Computer Science")
                .cgpa(new BigDecimal("8.00"))
                .activeBacklogs(2)
                .graduationYear(2026)
                .isVerified(true)
                .build();

        Internship internship = Internship.builder()
                .id(13L)
                .allowedBranches("Computer Science")
                .minCgpa(new BigDecimal("7.00"))
                .maxBacklogs(0)
                .graduationYear(2026)
                .build();

        EligibilityEvaluationResult result = engineService.evaluateEligibility(student, internship);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("active backlogs")));
    }

    @Test
    @DisplayName("Student meeting academic criteria but not yet verified is AWAITING_VERIFICATION")
    void testUnverifiedStudentAwaitingVerification() {
        Student student = Student.builder()
                .id(5L)
                .branch("Computer Science")
                .cgpa(new BigDecimal("8.50"))
                .activeBacklogs(0)
                .graduationYear(2026)
                .isVerified(false)
                .build();

        Internship internship = Internship.builder()
                .id(14L)
                .allowedBranches("Computer Science")
                .minCgpa(new BigDecimal("7.00"))
                .maxBacklogs(0)
                .graduationYear(2026)
                .build();

        EligibilityEvaluationResult result = engineService.evaluateEligibility(student, internship);

        assertFalse(result.isEligible());
        assertEquals(EligibilityStatus.AWAITING_VERIFICATION, result.getStatus());
        assertTrue(result.getCriteria().isRequiresVerification());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("pending institutional verification")));
    }
}
