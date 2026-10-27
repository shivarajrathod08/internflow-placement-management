package com.internflow.modules.document;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
@DisplayName("Document Controller Endpoints & Security Tests")
class DocumentControllerTest {

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
    @DisplayName("Unauthenticated request to document download without token should return 401 or 403")
    void testUnauthenticatedDownloadFails() throws Exception {
        mockMvc.perform(get("/api/documents/1/download"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Authenticated student should download own resume with Bearer token")
    void testAuthenticatedStudentDownloadsOwnResume() throws Exception {
        String studentToken = getTokenForUser("student@college.edu"); // Alex Rivera, Student 1, Document 1

        mockMvc.perform(get("/api/documents/1/download")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Alex_Rivera_Resume.pdf\""));
    }

    @Test
    @DisplayName("Authenticated student should download resume as attachment when requested")
    void testAuthenticatedStudentDownloadsAttachment() throws Exception {
        String studentToken = getTokenForUser("student@college.edu");

        mockMvc.perform(get("/api/documents/1/download?disposition=attachment")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Alex_Rivera_Resume.pdf\""));
    }

    @Test
    @DisplayName("Document download should accept token via query parameter for direct tab viewing")
    void testQueryParameterTokenAuthentication() throws Exception {
        String studentToken = getTokenForUser("student@college.edu");

        mockMvc.perform(get("/api/documents/1/download?token=" + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
    }

    @Test
    @DisplayName("Unauthorized student should receive 403 Forbidden when requesting another student's document")
    void testUnauthorizedStudentBlocked() throws Exception {
        String otherStudentToken = getTokenForUser("emily.watson@mit.edu"); // Emily Watson, Student 2

        mockMvc.perform(get("/api/documents/1/download")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + otherStudentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Company recruiter should download resume of candidate who applied to their company")
    void testRecruiterApplicantDownload() throws Exception {
        String googleRecruiterToken = getTokenForUser("recruiter@google.com"); // Google LLC, Alex Rivera applied

        mockMvc.perform(get("/api/documents/1/download")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + googleRecruiterToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
    }

    @Test
    @DisplayName("Admin should be able to view and download student document")
    void testAdminDownload() throws Exception {
        String adminToken = getTokenForUser("admin@internflow.edu");

        mockMvc.perform(get("/api/documents/1/download")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
    }

    @Test
    @DisplayName("Requesting non-existent document should return 404 Not Found")
    void testNonExistentDocumentReturns404() throws Exception {
        String adminToken = getTokenForUser("admin@internflow.edu");

        mockMvc.perform(get("/api/documents/999999/download")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }
}
