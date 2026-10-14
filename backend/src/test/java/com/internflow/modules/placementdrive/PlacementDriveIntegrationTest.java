package com.internflow.modules.placementdrive;

import com.internflow.modules.student.StudentProfileDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("Placement Drive Integration Tests")
class PlacementDriveIntegrationTest {

    @Autowired
    private PlacementDriveService driveService;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Test
    @DisplayName("Should create placement drive and retrieve eligible candidate shortlist")
    void testCreateDriveAndGetCandidates() {
        CreatePlacementDriveRequest request = new CreatePlacementDriveRequest();
        request.setTitle("Amazon Spring 2026 Drive");
        request.setDescription("Software Development Engineer Intern Drive");
        request.setAcademicYear("2025-2026");
        request.setDriveDate(LocalDateTime.now().plusDays(10));
        request.setRegistrationDeadline(LocalDateTime.now().plusDays(5));
        request.setVenueOrLink("Campus Auditorium");
        request.setEligibleBranches("Computer Science, Information Technology");
        request.setMinCgpa(new BigDecimal("8.00"));
        request.setRulesSummary("No active backlogs permitted");

        PlacementDriveDTO created = driveService.createDrive(request, 1L);

        assertNotNull(created.getId());
        assertEquals("Amazon Spring 2026 Drive", created.getTitle());
        assertEquals(PlacementDriveStatus.UPCOMING, created.getStatus());

        List<StudentProfileDTO> candidates = driveService.getEligibleCandidates(created.getId());
        assertNotNull(candidates);
        // Students with CS/IT and CGPA >= 8.00 and 0 active backlogs should be matched
        for (StudentProfileDTO s : candidates) {
            assertTrue(s.getCgpa().compareTo(new BigDecimal("8.00")) >= 0);
            assertEquals(0, s.getActiveBacklogs());
        }
    }
}
