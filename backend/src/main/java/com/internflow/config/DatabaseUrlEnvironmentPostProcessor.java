package com.internflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes PostgreSQL connection URLs from cloud platforms like Render, Supabase, Neon, and Railway.
 * Translates URLs in format "postgres://user:pass@host:port/dbname" or "postgresql://..."
 * into standard Spring Boot JDBC properties ("jdbc:postgresql://...").
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawDatabaseUrl = environment.getProperty("DATABASE_URL");
        if (rawDatabaseUrl == null || rawDatabaseUrl.isBlank()) {
            rawDatabaseUrl = environment.getProperty("DB_URL");
        }

        if (rawDatabaseUrl == null || rawDatabaseUrl.isBlank()) {
            return;
        }

        // If it's already a JDBC url, no translation needed
        if (rawDatabaseUrl.startsWith("jdbc:")) {
            return;
        }

        if (rawDatabaseUrl.startsWith("postgres://") || rawDatabaseUrl.startsWith("postgresql://")) {
            try {
                // Ensure URI parses properly
                String normalizedUriString = rawDatabaseUrl.startsWith("postgres://")
                        ? "postgresql://" + rawDatabaseUrl.substring("postgres://".length())
                        : rawDatabaseUrl;

                URI uri = new URI(normalizedUriString);
                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;

                if (userInfo != null && !userInfo.isEmpty()) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    if (parts.length > 1) {
                        password = parts[1];
                    }
                }

                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String databaseName = (path != null && path.length() > 1) ? path.substring(1) : "postgres";

                String query = uri.getQuery();
                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append("/")
                        .append(databaseName);

                if (query != null && !query.isEmpty()) {
                    jdbcUrl.append("?").append(query);
                } else if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host)) {
                    // On cloud managed databases (like Render PostgreSQL), SSL is typically required
                    jdbcUrl.append("?sslmode=require");
                }

                Map<String, Object> props = new HashMap<>();
                props.put("spring.datasource.url", jdbcUrl.toString());
                if (username != null) {
                    props.put("spring.datasource.username", username);
                }
                if (password != null) {
                    props.put("spring.datasource.password", password);
                }

                environment.getPropertySources().addFirst(new MapPropertySource("cloudDatabaseUrlProperties", props));
                log.info("Successfully converted cloud DATABASE_URL to JDBC configuration for host: {}, database: {}", host, databaseName);
            } catch (Exception e) {
                log.warn("Failed to parse cloud DATABASE_URL '{}': {}", rawDatabaseUrl, e.getMessage());
            }
        }
    }
}
