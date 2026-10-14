package com.internflow;

import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class InternFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Context loads and Flyway seeds demo accounts successfully")
    void contextLoadsAndDemoDataSeeded() {
        Optional<User> adminOpt = userRepository.findByEmail("admin@internflow.edu");
        assertTrue(adminOpt.isPresent(), "Admin user should exist in seeded database");

        User admin = adminOpt.get();
        assertNotNull(admin.getPasswordHash(), "Admin password hash should not be null");
        assertTrue(passwordEncoder.matches("Password@123", admin.getPasswordHash()),
                "Default demo password 'Password@123' must match BCrypt hash");
    }

    @Test
    @DisplayName("Public endpoints should be accessible without JWT authentication")
    void publicEndpointsAccessible() throws Exception {
        mockMvc.perform(get("/api/internships/public"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/skills/public"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected student endpoints should return 401/403 when unauthenticated")
    void protectedEndpointsRejectUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/students/me"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/company/profile"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/audit-logs"))
                .andExpect(status().isForbidden());
    }
}
