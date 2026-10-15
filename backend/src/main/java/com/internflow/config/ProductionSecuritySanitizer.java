package com.internflow.config;

import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Production safeguard ensuring that known seed demo accounts with public default credentials
 * cannot be accessed in production environments.
 */
@Slf4j
@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProductionSecuritySanitizer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

        for (String email : DEMO_EMAILS) {
            userRepository.findByEmail(email).ifPresent(user -> {
                // If account still carries the public seed hash, deactivate it to prevent unauthorized login
                if (DEFAULT_SEED_HASH.equals(user.getPasswordHash()) || passwordEncoder.matches("Password@123", user.getPasswordHash())) {
                    user.setActive(false);
                    userRepository.save(user);
                    log.warn("ProductionSecuritySanitizer: Deactivated unrotated demo account '{}' for production security.", email);
                }
            });
        }

        log.info("ProductionSecuritySanitizer: Production credential posture validated.");
    }
}
