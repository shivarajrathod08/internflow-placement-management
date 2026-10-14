package com.internflow.modules.matching;

import com.internflow.modules.internship.Internship;
import com.internflow.modules.internship.InternshipSkill;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentProject;
import com.internflow.modules.student.StudentSkill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingEngineService {

    public MatchResultDTO calculateMatch(Student student, Internship internship) {
        List<String> eligibilityNotes = new ArrayList<>();
        boolean isEligible = true;

        // 1. ACADEMIC ELIGIBILITY CHECK (Weight: 10 points)
        double academicScore = 0.0;

        // CGPA check
        if (internship.getMinCgpa() != null && internship.getMinCgpa().compareTo(BigDecimal.ZERO) > 0) {
            if (student.getCgpa() != null && student.getCgpa().compareTo(internship.getMinCgpa()) >= 0) {
                academicScore += 5.0;
                eligibilityNotes.add(String.format("CGPA meets requirement (%s >= %s)", student.getCgpa(), internship.getMinCgpa()));
            } else {
                isEligible = false;
                eligibilityNotes.add(String.format("CGPA below required minimum (%s < %s)",
                        student.getCgpa() != null ? student.getCgpa() : "N/A", internship.getMinCgpa()));
            }
        } else {
            academicScore += 5.0;
            eligibilityNotes.add("No minimum CGPA restriction");
        }

        // Branch check
        if (internship.getAllowedBranches() != null && !internship.getAllowedBranches().isBlank()
                && !internship.getAllowedBranches().equalsIgnoreCase("All Branches")) {
            String studentBranch = student.getBranch() != null ? student.getBranch().toLowerCase() : "";
            boolean branchMatches = Arrays.stream(internship.getAllowedBranches().toLowerCase().split(","))
                    .map(String::trim)
                    .anyMatch(b -> !b.isBlank() && studentBranch.contains(b));

            if (branchMatches) {
                academicScore += 3.0;
                eligibilityNotes.add(String.format("Branch permitted (%s)", student.getBranch()));
            } else {
                isEligible = false;
                eligibilityNotes.add(String.format("Branch '%s' not listed in permitted branches (%s)",
                        student.getBranch() != null ? student.getBranch() : "N/A", internship.getAllowedBranches()));
            }
        } else {
            academicScore += 3.0;
            eligibilityNotes.add("All branches eligible");
        }

        // Graduation Year check
        if (internship.getGraduationYear() != null) {
            if (student.getGraduationYear() != null && student.getGraduationYear().equals(internship.getGraduationYear())) {
                academicScore += 2.0;
                eligibilityNotes.add(String.format("Graduation year matches (%d)", student.getGraduationYear()));
            } else {
                eligibilityNotes.add(String.format("Target graduation year is %d (student: %s)",
                        internship.getGraduationYear(), student.getGraduationYear() != null ? student.getGraduationYear().toString() : "N/A"));
            }
        } else {
            academicScore += 2.0;
        }

        // 2. SKILL MATCHING
        Map<Long, StudentSkill> studentSkillMap = student.getSkills() != null
                ? student.getSkills().stream().collect(Collectors.toMap(ss -> ss.getSkill().getId(), ss -> ss, (a, b) -> a))
                : Collections.emptyMap();

        List<InternshipSkill> requiredSkills = new ArrayList<>();
        List<InternshipSkill> preferredSkills = new ArrayList<>();

        if (internship.getSkills() != null) {
            for (InternshipSkill is : internship.getSkills()) {
                if (is.isRequired()) {
                    requiredSkills.add(is);
                } else {
                    preferredSkills.add(is);
                }
            }
        }

        List<String> matchedRequired = new ArrayList<>();
        List<String> missingRequired = new ArrayList<>();
        double reqProficiencyPoints = 0.0;

        for (InternshipSkill req : requiredSkills) {
            String skillName = req.getSkill().getCanonicalName();
            if (studentSkillMap.containsKey(req.getSkill().getId())) {
                StudentSkill ss = studentSkillMap.get(req.getSkill().getId());
                matchedRequired.add(skillName);

                // Proficiency multiplier
                double factor = switch (ss.getProficiencyLevel() != null ? ss.getProficiencyLevel().toUpperCase() : "INTERMEDIATE") {
                    case "ADVANCED" -> 1.0;
                    case "INTERMEDIATE" -> 0.8;
                    case "BEGINNER" -> 0.6;
                    default -> 0.7;
                };
                reqProficiencyPoints += factor;
            } else {
                missingRequired.add(skillName);
            }
        }

        // Weight: 50 points
        double requiredSkillsScore;
        if (requiredSkills.isEmpty()) {
            requiredSkillsScore = 50.0;
        } else {
            requiredSkillsScore = (reqProficiencyPoints / requiredSkills.size()) * 50.0;
        }

        // Preferred Skills (Weight: 20 points)
        List<String> matchedPreferred = new ArrayList<>();
        List<String> missingPreferred = new ArrayList<>();

        for (InternshipSkill pref : preferredSkills) {
            String skillName = pref.getSkill().getCanonicalName();
            if (studentSkillMap.containsKey(pref.getSkill().getId())) {
                matchedPreferred.add(skillName);
            } else {
                missingPreferred.add(skillName);
            }
        }

        double preferredSkillsScore;
        if (preferredSkills.isEmpty()) {
            preferredSkillsScore = 20.0; // No penalty if no preferred skills defined
        } else {
            preferredSkillsScore = ((double) matchedPreferred.size() / preferredSkills.size()) * 20.0;
        }

        // 3. EXPERIENCE & PROJECT RELEVANCE (Weight: 15 points)
        double experienceScore = 0.0;
        if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
            experienceScore += 7.5; // Prior real-world internship/work experience
        }

        // Project relevance check
        if (student.getProjects() != null && !student.getProjects().isEmpty()) {
            Set<String> targetSkillWords = new HashSet<>();
            for (InternshipSkill is : internship.getSkills()) {
                targetSkillWords.add(is.getSkill().getCanonicalName().toLowerCase());
            }

            long relevantProjects = student.getProjects().stream()
                    .filter(p -> isProjectRelevant(p, targetSkillWords))
                    .count();

            experienceScore += Math.min(7.5, relevantProjects * 3.75);
        }

        // 4. PROFILE COMPLETENESS (Weight: 5 points)
        double completenessScore = 0.0;
        if (student.getResumeUrl() != null && !student.getResumeUrl().isBlank()) {
            completenessScore += 2.5;
        }
        if (student.getBio() != null && !student.getBio().isBlank()) {
            completenessScore += 1.5;
        }
        if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
            completenessScore += 1.0;
        }

        // Total score calculation
        double rawTotal = requiredSkillsScore + preferredSkillsScore + experienceScore + academicScore + completenessScore;
        int finalScore = (int) Math.min(100, Math.max(0, Math.round(rawTotal)));

        // Generate explainability narrative
        String explanation = buildExplanation(finalScore, isEligible, matchedRequired, missingRequired,
                matchedPreferred, missingPreferred, academicScore, experienceScore);

        return MatchResultDTO.builder()
                .matchScore(finalScore)
                .eligible(isEligible)
                .eligibilityNotes(eligibilityNotes)
                .matchedRequiredSkills(matchedRequired)
                .missingRequiredSkills(missingRequired)
                .matchedPreferredSkills(matchedPreferred)
                .missingPreferredSkills(missingPreferred)
                .requiredSkillsScore(roundToTwo(requiredSkillsScore))
                .preferredSkillsScore(roundToTwo(preferredSkillsScore))
                .experienceScore(roundToTwo(experienceScore))
                .academicScore(roundToTwo(academicScore))
                .completenessScore(roundToTwo(completenessScore))
                .explanation(explanation)
                .build();
    }

    public SkillGapDTO analyzeSkillGap(Student student, Internship internship) {
        MatchResultDTO match = calculateMatch(student, internship);

        List<String> recommendations = new ArrayList<>();
        if (!match.getMissingRequiredSkills().isEmpty()) {
            recommendations.add(String.format("Priority: Acquire core required skills: %s",
                    String.join(", ", match.getMissingRequiredSkills())));
        }
        if (!match.getMissingPreferredSkills().isEmpty()) {
            recommendations.add(String.format("Bonus: Learn preferred technologies: %s to gain competitive edge",
                    String.join(", ", match.getMissingPreferredSkills())));
        }
        if (student.getProjects() == null || student.getProjects().isEmpty()) {
            recommendations.add("Build and publish hands-on projects showcasing key technologies on GitHub.");
        }
        if (student.getResumeUrl() == null || student.getResumeUrl().isBlank()) {
            recommendations.add("Upload your latest technical resume to maximize recruiter visibility.");
        }

        return SkillGapDTO.builder()
                .internshipTitle(internship.getTitle())
                .companyName(internship.getCompany().getCompanyName())
                .matchScore(match.getMatchScore())
                .eligible(match.isEligible())
                .missingRequiredSkills(match.getMissingRequiredSkills())
                .missingPreferredSkills(match.getMissingPreferredSkills())
                .recommendations(recommendations)
                .build();
    }

    private boolean isProjectRelevant(StudentProject project, Set<String> targetSkills) {
        String text = (project.getTitle() + " " + project.getDescription() + " " + project.getTechStack()).toLowerCase();
        return targetSkills.stream().anyMatch(text::contains);
    }

    private double roundToTwo(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private String buildExplanation(int score, boolean eligible, List<String> matchedReq, List<String> missingReq,
                                     List<String> matchedPref, List<String> missingPref, double academic, double exp) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Match Score: %d%%. ", score));
        if (!eligible) {
            sb.append("Note: Does not meet all hard academic eligibility criteria. ");
        } else {
            sb.append("Academic criteria fully satisfied. ");
        }

        if (!matchedReq.isEmpty()) {
            sb.append(String.format("Matches %d core required skills (%s). ",
                    matchedReq.size(), String.join(", ", matchedReq)));
        }
        if (!missingReq.isEmpty()) {
            sb.append(String.format("Missing required skills: %s. ", String.join(", ", missingReq)));
        }
        if (!matchedPref.isEmpty()) {
            sb.append(String.format("Matched %d bonus preferred skills (%s). ",
                    matchedPref.size(), String.join(", ", matchedPref)));
        }
        if (exp > 5.0) {
            sb.append("Strong boost from relevant projects and experience. ");
        }
        return sb.toString().trim();
    }
}
