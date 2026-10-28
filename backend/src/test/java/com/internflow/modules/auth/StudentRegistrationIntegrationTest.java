package com.internflow.modules.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentRepository;
import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class StudentRegistrationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("1 & 6 & 7 & 8: Successful student registration persists records, hashes password, and links entities")
    void testSuccessfulStudentRegistration() throws Exception {
        String testEmail = "charlotte.bronte.unique@internflow.edu";

        RegisterStudentRequest request = RegisterStudentRequest.builder()
                .email(testEmail)
                .password("SecurePassword2026!")
                .firstName("Charlotte")
                .lastName("Bronte")
                .phone("+1 555-0199")
                .college("Oxford University")
                .degree("B.Tech")
                .branch("Computer Science & Engineering")
                .graduationYear(2026)
                .cgpa(new BigDecimal("9.25"))
                .build();

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value(testEmail.toLowerCase()))
                .andExpect(jsonPath("$.data.role").value("STUDENT"))
                .andExpect(jsonPath("$.data.profileId").isNotEmpty())
                .andExpect(jsonPath("$.data.name").value("Charlotte Bronte"));

        // Verify User persistence & BCrypt hashing
        Optional<User> savedUserOpt = userRepository.findByEmail(testEmail.toLowerCase());
        assertTrue(savedUserOpt.isPresent(), "User entity must be persisted in database");
        User savedUser = savedUserOpt.get();
        assertEquals(Role.STUDENT, savedUser.getRole());
        assertTrue(savedUser.isActive(), "Registered student must be active");
        assertNotEquals("SecurePassword2026!", savedUser.getPasswordHash(), "Password must not be stored in plaintext");
        assertTrue(passwordEncoder.matches("SecurePassword2026!", savedUser.getPasswordHash()), "BCrypt password verification must succeed");

        // Verify Student persistence & foreign-key relationship
        Optional<Student> savedStudentOpt = studentRepository.findByUserId(savedUser.getId());
        assertTrue(savedStudentOpt.isPresent(), "Student profile must be linked to User via user_id foreign key");
        Student savedStudent = savedStudentOpt.get();
        assertEquals("Charlotte", savedStudent.getFirstName());
        assertEquals("Bronte", savedStudent.getLastName());
        assertEquals("Oxford University", savedStudent.getCollege());
        assertEquals(2026, savedStudent.getGraduationYear());
        assertEquals(new BigDecimal("9.25"), savedStudent.getCgpa());
        assertEquals(0, savedStudent.getActiveBacklogs());
        assertEquals(0, savedStudent.getTotalBacklogs());
        assertFalse(savedStudent.getIsVerified());
    }

    @Test
    @DisplayName("2: Duplicate email submission returns 409 Conflict without echoing internal details")
    void testDuplicateEmailSubmissionReturnsConflict() throws Exception {
        // student@college.edu already seeded in V3 migration
        RegisterStudentRequest request = RegisterStudentRequest.builder()
                .email("student@college.edu")
                .password("Password@123")
                .firstName("Duplicate")
                .lastName("Attempt")
                .college("Another University")
                .branch("IT")
                .graduationYear(2026)
                .cgpa(new BigDecimal("8.00"))
                .build();

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("CONFLICT"))
                .andExpect(jsonPath("$.message").value("An account with this email address already exists. Please sign in instead."));
    }

    @Test
    @DisplayName("3 & 5: Missing required fields and invalid email/password return 400 Bad Request with field errors")
    void testMissingRequiredFieldsAndInvalidFormat() throws Exception {
        RegisterStudentRequest invalidRequest = RegisterStudentRequest.builder()
                .email("not-an-email")
                .password("123") // too short (< 6)
                .firstName("")   // blank
                .lastName("")    // blank
                .build();

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.details", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    @DisplayName("4: Invalid CGPA or graduation year returns 400 Bad Request")
    void testInvalidCgpaAndGraduationYear() throws Exception {
        RegisterStudentRequest invalidScores = RegisterStudentRequest.builder()
                .email("valid.email@internflow.edu")
                .password("ValidPass123!")
                .firstName("John")
                .lastName("Doe")
                .cgpa(new BigDecimal("15.50")) // Exceeds 10.00
                .graduationYear(1800)          // Precedes 1950
                .build();

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidScores)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("10: Successful login after registration using registered credentials")
    void testSuccessfulLoginAfterRegistration() throws Exception {
        String testEmail = "arthur.conan.doyle@internflow.edu";
        String rawPassword = "SherlockPassword2026!";

        RegisterStudentRequest registerRequest = RegisterStudentRequest.builder()
                .email(testEmail)
                .password(rawPassword)
                .firstName("Arthur")
                .lastName("Doyle")
                .college("Edinburgh")
                .branch("Medicine & Informatics")
                .graduationYear(2026)
                .cgpa(new BigDecimal("9.50"))
                .build();

        // 1. Register student
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // 2. Perform login with newly created credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(testEmail);
        loginRequest.setPassword(rawPassword);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value(testEmail.toLowerCase()))
                .andExpect(jsonPath("$.data.role").value("STUDENT"))
                .andExpect(jsonPath("$.data.active").value(true));
    }
}
