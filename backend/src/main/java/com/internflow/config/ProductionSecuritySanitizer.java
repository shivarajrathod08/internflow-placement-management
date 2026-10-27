package com.internflow.config;

import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Production safeguard ensuring that known seed demo accounts with public default credentials
 * cannot be accessed in production environments, while allowing secure initial administrator provisioning
 * via environment variables (INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD).
 */
@Slf4j
@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProductionSecuritySanitizer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.initial-admin-email:admin@internflow.edu}")
    private String initialAdminEmail;

    @Value("${app.security.initial-admin-password:}")
    private String initialAdminPassword;

    // Default BCrypt hash for 'Password@123' used in Flyway V3 migration
    private static final String DEFAULT_SEED_HASH = "$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK";

    private static final List<String> DEMO_EMAILS = List.of(
            "admin@internflow.edu",
            "recruiter@google.com",
            "recruiter@startup.io",
            "recruiter@microsoft.com",
            "student@college.edu",
            "emily.watson@mit.edu",
            "david.kim@berkeley.edu",
            "tpo@internflow.edu",
            "faculty@internflow.edu"
    );

    @Override
    public void run(String... args) {
        log.info("ProductionSecuritySanitizer: Verifying credential posture in production environment...");

        boolean adminConfigured = false;
        String trimmedAdminEmail = (initialAdminEmail != null) ? initialAdminEmail.trim() : "admin@internflow.edu";
        String trimmedAdminPassword = (initialAdminPassword != null) ? initialAdminPassword.trim() : "";

        if (!trimmedAdminPassword.isEmpty()) {
            if ("Password@123".equals(trimmedAdminPassword)) {
                log.error("ProductionSecuritySanitizer: INITIAL_ADMIN_PASSWORD matches default demo password. Refusing to activate admin with insecure password.");
            } else if (trimmedAdminPassword.length() < 8) {
                log.error("ProductionSecuritySanitizer: INITIAL_ADMIN_PASSWORD must be at least 8 characters long.");
            } else {
                User admin = userRepository.findByEmail(trimmedAdminEmail).orElse(null);
                if (admin == null) {
                    admin = User.builder()
                            .email(trimmedAdminEmail)
                            .role(Role.ADMIN)
                            .passwordHash(passwordEncoder.encode(trimmedAdminPassword))
                            .active(true)
                            .build();
                } else {
                    admin.setPasswordHash(passwordEncoder.encode(trimmedAdminPassword));
                    admin.setActive(true);
                    admin.setRole(Role.ADMIN);
                }
                userRepository.save(admin);
                adminConfigured = true;
                log.info("ProductionSecuritySanitizer: Configured and activated production administrator '{}'.", trimmedAdminEmail);
            }
        }

        for (String email : DEMO_EMAILS) {
            // If this email is the explicitly configured admin, skip deactivation
            if (adminConfigured && email.equalsIgnoreCase(trimmedAdminEmail)) {
                continue;
            }

            userRepository.findByEmail(email).ifPresent(user -> {
                // If account still carries the public seed hash, deactivate it to prevent unauthorized login
                if (DEFAULT_SEED_HASH.equals(user.getPasswordHash()) || passwordEncoder.matches("Password@123", user.getPasswordHash())) {
                    user.setActive(false);
                    userRepository.save(user);
                    log.warn("ProductionSecuritySanitizer: Deactivated unrotated demo account '{}' for production security.", email);
                }
            });
        }

        if (!adminConfigured) {
            log.warn("ProductionSecuritySanitizer: Notice: INITIAL_ADMIN_PASSWORD is not set in environment variables. Set INITIAL_ADMIN_PASSWORD in your Render Dashboard to provision an active administrator.");
        }

        log.info("ProductionSecuritySanitizer: Production credential posture validated.");
    }
}
