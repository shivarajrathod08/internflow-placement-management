package com.internflow.config;

import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductionSecuritySanitizerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private ProductionSecuritySanitizer sanitizer;

    @BeforeEach
    void setUp() {
        sanitizer = new ProductionSecuritySanitizer(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Deactivates unrotated demo accounts carrying seed hash when no admin password provided")
    void testDeactivatesUnrotatedDemoAccounts() {
        ReflectionTestUtils.setField(sanitizer, "initialAdminEmail", "admin@internflow.edu");
        ReflectionTestUtils.setField(sanitizer, "initialAdminPassword", "");

        User demoAdmin = User.builder()
                .id(1L)
                .email("admin@internflow.edu")
                .passwordHash("$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK")
                .active(true)
                .role(Role.ADMIN)
                .build();

        when(userRepository.findByEmail("admin@internflow.edu")).thenReturn(Optional.of(demoAdmin));

        sanitizer.run();

        assertFalse(demoAdmin.isActive(), "Demo admin should be deactivated when unrotated");
        verify(userRepository, atLeastOnce()).save(demoAdmin);
    }

    @Test
    @DisplayName("Provisions and activates admin account when valid INITIAL_ADMIN_PASSWORD provided")
    void testProvisionsAdminWhenPasswordConfigured() {
        ReflectionTestUtils.setField(sanitizer, "initialAdminEmail", "admin@internflow.edu");
        ReflectionTestUtils.setField(sanitizer, "initialAdminPassword", "SecureProdPassword2026!");

        User existingAdmin = User.builder()
                .id(1L)
                .email("admin@internflow.edu")
                .passwordHash("oldHash")
                .active(false)
                .role(Role.ADMIN)
                .build();

        when(userRepository.findByEmail("admin@internflow.edu")).thenReturn(Optional.of(existingAdmin));
        when(passwordEncoder.encode("SecureProdPassword2026!")).thenReturn("$2a$10$newSecureEncodedHash");

        sanitizer.run();

        assertTrue(existingAdmin.isActive(), "Admin should be activated");
        assertEquals("$2a$10$newSecureEncodedHash", existingAdmin.getPasswordHash());
        verify(userRepository, atLeastOnce()).save(existingAdmin);
    }
}
