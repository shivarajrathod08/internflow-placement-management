package com.internflow.modules.eligibility;

import com.internflow.modules.internship.Internship;
import com.internflow.modules.student.Student;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class EligibilityEngineService {

    public EligibilityEvaluationResult evaluateEligibility(Student student, Internship internship) {
        List<String> reasons = new ArrayList<>();
        boolean requiresVerification = false;

        // Parse allowed branches
        List<String> allowedBranches = new ArrayList<>();
        if (internship.getAllowedBranches() != null && !internship.getAllowedBranches().isBlank()) {
            allowedBranches = Arrays.stream(internship.getAllowedBranches().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        // 1. Check branch eligibility
        if (!allowedBranches.isEmpty()) {
            String studentBranch = student.getBranch() != null ? student.getBranch().trim() : "";
            boolean branchMatched = allowedBranches.stream()
                    .anyMatch(b -> b.equalsIgnoreCase(studentBranch));
            if (!branchMatched) {
                reasons.add("Your branch '" + (studentBranch.isEmpty() ? "Not Specified" : studentBranch) +
                        "' is not in the list of eligible branches: " + String.join(", ", allowedBranches));
            }
        }

        // 2. Check CGPA eligibility
        if (internship.getMinCgpa() != null && internship.getMinCgpa().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal studentCgpa = student.getCgpa() != null ? student.getCgpa() : BigDecimal.ZERO;
            if (studentCgpa.compareTo(internship.getMinCgpa()) < 0) {
                reasons.add(String.format("Minimum CGPA required is %.2f, but your current CGPA is %.2f",
                        internship.getMinCgpa(), studentCgpa));
            }
        }

        // 3. Check Backlog eligibility
        if (internship.getMaxBacklogs() != null) {
            int studentActiveBacklogs = student.getActiveBacklogs() != null ? student.getActiveBacklogs() : 0;
            if (studentActiveBacklogs > internship.getMaxBacklogs()) {
                reasons.add(String.format("Opportunity permits at most %d active backlogs, but you have %d active backlogs",
                        internship.getMaxBacklogs(), studentActiveBacklogs));
            }
        }

        // 4. Check Graduation Year
        if (internship.getGraduationYear() != null && student.getGraduationYear() != null) {
            if (!internship.getGraduationYear().equals(student.getGraduationYear())) {
                reasons.add(String.format("This opportunity is for the class of %d (your graduation year is %d)",
                        internship.getGraduationYear(), student.getGraduationYear()));
            }
        }

        // 5. Verification status
        EligibilityStatus status;
        if (reasons.isEmpty()) {
            status = EligibilityStatus.ELIGIBLE;
        } else {
            status = EligibilityStatus.INELIGIBLE;
        }

        EligibilityCriteriaDTO criteriaDTO = EligibilityCriteriaDTO.builder()
                .minCgpa(internship.getMinCgpa())
                .maxBacklogs(internship.getMaxBacklogs())
                .allowedBranches(allowedBranches)
                .graduationYear(internship.getGraduationYear())
                .requiresVerification(requiresVerification)
                .build();

        return EligibilityEvaluationResult.builder()
                .internshipId(internship.getId())
                .studentId(student.getId())
                .eligible(reasons.isEmpty())
                .status(status)
                .reasons(reasons)
                .criteria(criteriaDTO)
                .build();
    }
}
