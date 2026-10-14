package com.internflow.config;

import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Profile("local")
@ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
public class DemoDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing & verifying demo user passwords with BCrypt...");
        String defaultPass = "Password@123";

        List<String> demoEmails = List.of(
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

        for (String email : demoEmails) {
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setPasswordHash(passwordEncoder.encode(defaultPass));
                userRepository.save(user);
            });
        }

        log.info("Demo user credentials verified for active local environment.");
    }
}
