package com.internflow.modules.application;

import com.internflow.security.CustomUserDetails;
import com.internflow.security.CustomUserDetailsService;
import com.internflow.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
@DisplayName("Application Resume Access & Recruiter Authorization Tests")
class ApplicationResumeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    private String getTokenForUser(String email) {
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);
        return jwtTokenProvider.generateTokenFromUserDetails(userDetails);
    }

    @Test
    @DisplayName("Unauthenticated request to application resume should be rejected with 401 or 403")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/applications/1/resume"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Authorized recruiter should view candidate resume for their company's posting")
    void testAuthorizedRecruiterCanViewCandidateResume() throws Exception {
        // Application 1: Alex Rivera applied to Google LLC (Cloud Platforms Intern)
        // User ID 2: recruiter@google.com
        String googleToken = getTokenForUser("recruiter@google.com");

        mockMvc.perform(get("/api/applications/1/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + googleToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("Alex_Rivera_Resume.pdf")));
    }

    @Test
    @DisplayName("Unauthorized recruiter should be rejected with 403 when trying to access another company's application resume")
    void testUnauthorizedRecruiterCannotAccessCandidateResume() throws Exception {
        // User ID 4: recruiter@microsoft.com attempting to access Application 1 (Google posting)
        String msftToken = getTokenForUser("recruiter@microsoft.com");

        mockMvc.perform(get("/api/applications/1/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + msftToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Recruiter accessing candidate with no uploaded resume should return 404 with helpful message")
    void testCandidateWithNoResumeReturns404() throws Exception {
        // Application 4: David Kim applied to Google LLC (Internship 1)
        // David Kim has not uploaded a resume document
        String googleToken = getTokenForUser("recruiter@google.com");

        mockMvc.perform(get("/api/applications/4/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + googleToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("David Kim has not uploaded a resume document yet")));
    }

    @Test
    @DisplayName("Student should view resume for their own application")
    void testStudentCanViewOwnApplicationResume() throws Exception {
        // Application 1 belongs to Alex Rivera (user ID 5: student@college.edu)
        String alexToken = getTokenForUser("student@college.edu");

        mockMvc.perform(get("/api/applications/1/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + alexToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
    }

    @Test
    @DisplayName("Student cannot view resume for another student's application")
    void testStudentCannotViewOtherApplicationResume() throws Exception {
        // Emily Watson (user ID 6) attempting to view Alex Rivera's Application 1 resume
        String emilyToken = getTokenForUser("emily.watson@mit.edu");

        mockMvc.perform(get("/api/applications/1/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + emilyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Administrator can view candidate resume for any application")
    void testAdminCanViewApplicationResume() throws Exception {
        String adminToken = getTokenForUser("admin@internflow.edu");

        mockMvc.perform(get("/api/applications/1/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
    }

    @Test
    @DisplayName("Non-existent application ID should return 404 Not Found")
    void testNonExistentApplicationReturns404() throws Exception {
        String adminToken = getTokenForUser("admin@internflow.edu");

        mockMvc.perform(get("/api/applications/999999/resume")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }
}
