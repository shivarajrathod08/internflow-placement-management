package com.internflow.modules.analytics;

import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.application.Application;
import com.internflow.modules.application.ApplicationRepository;
import com.internflow.modules.application.ApplicationStatus;
import com.internflow.modules.company.Company;
import com.internflow.modules.company.CompanyRepository;
import com.internflow.modules.company.CompanyVerificationStatus;
import com.internflow.modules.internship.*;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentProfileDTO;
import com.internflow.modules.student.StudentRepository;
import com.internflow.modules.student.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final InternshipRepository internshipRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentService studentService;
    private final com.internflow.modules.offer.OfferRepository offerRepository;

    @Transactional(readOnly = true)
    public String generatePlacementsCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Roll Number,Student Name,Email,Branch,CGPA,Company,Job Title,Status,CTC/Stipend,Offer Date\n");

        List<com.internflow.modules.offer.Offer> offers = offerRepository.findAll();
        for (com.internflow.modules.offer.Offer o : offers) {
            String roll = o.getStudent().getRollNumber() != null ? o.getStudent().getRollNumber() : "N/A";
            String name = (o.getStudent().getFirstName() + " " + o.getStudent().getLastName()).replace(",", " ");
            String email = o.getStudent().getUser().getEmail();
            String branch = o.getStudent().getBranch() != null ? o.getStudent().getBranch().replace(",", " ") : "N/A";
            String cgpa = o.getStudent().getCgpa() != null ? o.getStudent().getCgpa().toString() : "N/A";
            String company = o.getCompany().getCompanyName().replace(",", " ");
            String role = o.getDesignation().replace(",", " ");
            String status = o.getStatus().name();
            String ctc = o.getCtcOrStipend().toString();
            String date = o.getOfferDate().toString();

            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    roll, name, email, branch, cgpa, company, role, status, ctc, date));
        }

        return csv.toString();
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsDTO getAdminAnalytics() {
        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long verifiedCompanies = companyRepository.countByVerificationStatus(CompanyVerificationStatus.APPROVED);
        long pendingCompanies = companyRepository.countByVerificationStatus(CompanyVerificationStatus.PENDING);

        long totalInternships = internshipRepository.count();
        long publishedInternships = internshipRepository.countByStatus(InternshipStatus.PUBLISHED);
        long pendingInternships = internshipRepository.countByStatus(InternshipStatus.PENDING_APPROVAL);

        long totalApps = applicationRepository.count();
        long shortlisted = applicationRepository.countByCurrentStatus(ApplicationStatus.SHORTLISTED);
        long selected = applicationRepository.countByCurrentStatus(ApplicationStatus.SELECTED);
        long completed = applicationRepository.countByCurrentStatus(ApplicationStatus.COMPLETED);

        double shortlistRate = totalApps > 0 ? ((double) shortlisted / totalApps) * 100.0 : 0.0;
        double selectionRate = totalApps > 0 ? ((double) selected / totalApps) * 100.0 : 0.0;
        double completionRate = totalApps > 0 ? ((double) completed / totalApps) * 100.0 : 0.0;

        // Group applications by status
        List<Application> allApps = applicationRepository.findAll();
        Map<String, Long> appsByStatus = allApps.stream()
                .collect(Collectors.groupingBy(a -> a.getCurrentStatus().name(), Collectors.counting()));

        // Work mode distribution
        List<Internship> allInternships = internshipRepository.findAll();
        Map<String, Long> byWorkMode = allInternships.stream()
                .collect(Collectors.groupingBy(i -> i.getWorkMode().name(), Collectors.counting()));

        // Top demanded skills
        Map<String, Long> demandedSkills = new HashMap<>();
        for (Internship i : allInternships) {
            if (i.getSkills() != null) {
                for (InternshipSkill is : i.getSkills()) {
                    String sName = is.getSkill().getCanonicalName();
                    demandedSkills.put(sName, demandedSkills.getOrDefault(sName, 0L) + 1L);
                }
            }
        }

        // Limit to top 8 demanded skills
        Map<String, Long> topDemanded = demandedSkills.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        return AdminAnalyticsDTO.builder()
                .totalStudents(totalStudents)
                .totalCompanies(totalCompanies)
                .verifiedCompanies(verifiedCompanies)
                .pendingCompanies(pendingCompanies)
                .totalInternships(totalInternships)
                .publishedInternships(publishedInternships)
                .pendingInternships(pendingInternships)
                .totalApplications(totalApps)
                .shortlistedCount(shortlisted)
                .selectedCount(selected)
                .completedCount(completed)
                .shortlistRate(Math.round(shortlistRate * 10.0) / 10.0)
                .selectionRate(Math.round(selectionRate * 10.0) / 10.0)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .applicationsByStatus(appsByStatus)
                .topDemandedSkills(topDemanded)
                .internshipsByWorkMode(byWorkMode)
                .build();
    }

    @Transactional(readOnly = true)
    public CompanyAnalyticsDTO getCompanyAnalytics(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found for user: " + userId));

        List<Internship> companyPostings = internshipRepository.findByCompanyId(company.getId());
        long totalPostings = companyPostings.size();
        long publishedPostings = companyPostings.stream().filter(i -> i.getStatus() == InternshipStatus.PUBLISHED).count();
        long pendingPostings = companyPostings.stream().filter(i -> i.getStatus() == InternshipStatus.PENDING_APPROVAL).count();

        List<Application> companyApps = new ArrayList<>();
        for (Internship i : companyPostings) {
            companyApps.addAll(applicationRepository.findByInternshipId(i.getId()));
        }

        long totalApplicants = companyApps.size();
        long shortlisted = companyApps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.SHORTLISTED).count();
        long interviewed = companyApps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.INTERVIEW_SCHEDULED || a.getCurrentStatus() == ApplicationStatus.INTERVIEW_COMPLETED).count();
        long selected = companyApps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.SELECTED || a.getCurrentStatus() == ApplicationStatus.JOINED || a.getCurrentStatus() == ApplicationStatus.COMPLETED).count();

        double shortlistConversion = totalApplicants > 0 ? ((double) shortlisted / totalApplicants) * 100.0 : 0.0;
        double hireConversion = totalApplicants > 0 ? ((double) selected / totalApplicants) * 100.0 : 0.0;

        Map<String, Long> statusMap = companyApps.stream()
                .collect(Collectors.groupingBy(a -> a.getCurrentStatus().name(), Collectors.counting()));

        return CompanyAnalyticsDTO.builder()
                .totalPostings(totalPostings)
                .publishedPostings(publishedPostings)
                .pendingPostings(pendingPostings)
                .totalApplicants(totalApplicants)
                .shortlistedApplicants(shortlisted)
                .interviewedApplicants(interviewed)
                .selectedApplicants(selected)
                .shortlistConversionRate(Math.round(shortlistConversion * 10.0) / 10.0)
                .hireConversionRate(Math.round(hireConversion * 10.0) / 10.0)
                .applicationsByStatus(statusMap)
                .build();
    }

    @Transactional(readOnly = true)
    public StudentAnalyticsDTO getStudentAnalytics(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        List<Application> apps = applicationRepository.findByStudentId(student.getId());
        long totalApps = apps.size();
        long underReview = apps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.UNDER_REVIEW).count();
        long shortlisted = apps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.SHORTLISTED).count();
        long interviews = apps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.INTERVIEW_SCHEDULED).count();
        long selected = apps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.SELECTED || a.getCurrentStatus() == ApplicationStatus.JOINED).count();
        long completed = apps.stream().filter(a -> a.getCurrentStatus() == ApplicationStatus.COMPLETED).count();

        StudentProfileDTO profile = StudentProfileDTO.from(student);

        Map<String, Long> statusMap = apps.stream()
                .collect(Collectors.groupingBy(a -> a.getCurrentStatus().name(), Collectors.counting()));

        return StudentAnalyticsDTO.builder()
                .totalApplications(totalApps)
                .underReviewCount(underReview)
                .shortlistedCount(shortlisted)
                .interviewScheduledCount(interviews)
                .selectedCount(selected)
                .completedCount(completed)
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .statusCounts(statusMap)
                .build();
    }
}
