package com.internflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Normalizes PostgreSQL connection URLs from cloud platforms like Render, Supabase, Neon, and Railway.
 * Translates URLs in format "postgres://user:pass@host:port/dbname" or "postgresql://..."
 * into standard Spring Boot and Flyway JDBC properties ("jdbc:postgresql://...").
 *
 * Ordered with LOWEST_PRECEDENCE so it executes AFTER ConfigDataEnvironmentPostProcessor,
 * ensuring cloud properties added via addFirst take absolute precedence over application-prod.yml.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlEnvironmentPostProcessor.class);

    // Regex pattern for cloud postgres URLs supporting special characters in passwords
    private static final Pattern POSTGRES_URL_PATTERN = Pattern.compile(
            "^(?:postgres(?:ql)?://)(?:([^:@]+)(?::([^@]*))?@)?([^:/?#]+)(?::([0-9]+))?(?:/([^?#]*))?(?:\\?(.*))?$"
    );

    // Regex pattern for JDBC postgres URLs that might have embedded credentials
    private static final Pattern JDBC_EMBEDDED_AUTH_PATTERN = Pattern.compile(
            "^jdbc:postgresql://(?:([^:@]+)(?::([^@]*))?@)([^:/?#]+)(?::([0-9]+))?(?:/([^?#]*))?(?:\\?(.*))?$"
    );

    @Override
    public int getOrder() {
        // Runs after ConfigDataEnvironmentPostProcessor so cloudDatabaseUrlProperties can be placed at index 0
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawDatabaseUrl = environment.getProperty("DATABASE_URL");
        if (rawDatabaseUrl == null || rawDatabaseUrl.isBlank()) {
            rawDatabaseUrl = environment.getProperty("SPRING_DATASOURCE_URL");
        }
        if (rawDatabaseUrl == null || rawDatabaseUrl.isBlank()) {
            rawDatabaseUrl = environment.getProperty("DB_URL");
        }

        boolean isProdActive = isProductionProfileActive(environment);

        if (rawDatabaseUrl == null || rawDatabaseUrl.isBlank()) {
            if (isProdActive) {
                String errorMsg = "Production database configuration is missing. " +
                        "DATABASE_URL must be provided in the production environment (e.g. Render Dashboard). " +
                        "The application will not start with an unconfigured localhost database in production.";
                log.error("Fatal Configuration Error: {}", errorMsg);
                throw new IllegalStateException(errorMsg);
            }
            return;
        }

        Map<String, Object> props = parseDatabaseConfiguration(rawDatabaseUrl);
        if (props != null && !props.isEmpty()) {
            // Place at index 0 (highest priority) in PropertySources
            environment.getPropertySources().addFirst(new MapPropertySource("cloudDatabaseUrlProperties", props));
        } else if (isProdActive) {
            String errorMsg = "Failed to parse production DATABASE_URL into a valid JDBC configuration. " +
                    "Please verify your database connection string in the Render Dashboard.";
            log.error("Fatal Configuration Error: {}", errorMsg);
            throw new IllegalStateException(errorMsg);
        }
    }

    /**
     * Parses cloud database URL into JDBC properties without logging credentials.
     */
    public Map<String, Object> parseDatabaseConfiguration(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }

        String trimmed = rawUrl.trim();

        // 1. Handle JDBC format
        if (trimmed.startsWith("jdbc:postgresql:")) {
            return handleJdbcUrl(trimmed);
        }

        // 2. Handle postgres:// and postgresql:// formats
        if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
            return handleCloudPostgresUrl(trimmed);
        }

        return null;
    }

    private Map<String, Object> handleJdbcUrl(String jdbcUrl) {
        String username = null;
        String password = null;
        String finalUrl = jdbcUrl;
        String host = "unknown";
        int port = 5432;
        String databaseName = "unknown";

        Matcher authMatcher = JDBC_EMBEDDED_AUTH_PATTERN.matcher(jdbcUrl);
        if (authMatcher.matches()) {
            username = authMatcher.group(1);
            password = authMatcher.group(2);
            host = authMatcher.group(3);
            String portStr = authMatcher.group(4);
            if (portStr != null && !portStr.isBlank()) {
                try {
                    port = Integer.parseInt(portStr);
                } catch (NumberFormatException ignored) {}
            }
            String dbStr = authMatcher.group(5);
            if (dbStr != null && !dbStr.isBlank()) {
                databaseName = dbStr;
            }
            String query = authMatcher.group(6);

            StringBuilder cleanUrl = new StringBuilder("jdbc:postgresql://")
                    .append(host)
                    .append(":")
                    .append(port)
                    .append("/")
                    .append(databaseName);

            if (query != null && !query.isEmpty()) {
                cleanUrl.append("?").append(query);
            } else if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host)) {
                cleanUrl.append("?sslmode=require");
            }
            finalUrl = cleanUrl.toString();
        } else {
            // Extract host and db if possible for sanitized log
            try {
                URI uri = new URI(jdbcUrl.substring(5)); // strip "jdbc:"
                host = uri.getHost() != null ? uri.getHost() : "configured";
                port = uri.getPort() != -1 ? uri.getPort() : 5432;
                if (uri.getPath() != null && uri.getPath().length() > 1) {
                    databaseName = uri.getPath().substring(1);
                }
            } catch (Exception ignored) {}

            // Ensure SSL if remote host and query doesn't specify it
            if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host) &&
                    !finalUrl.contains("sslmode") && !finalUrl.contains("ssl=")) {
                finalUrl = finalUrl.contains("?") ? finalUrl + "&sslmode=require" : finalUrl + "?sslmode=require";
            }
        }

        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", finalUrl);
        props.put("spring.flyway.url", finalUrl);
        if (username != null) {
            props.put("spring.datasource.username", username);
            props.put("spring.flyway.user", username);
        }
        if (password != null) {
            props.put("spring.datasource.password", password);
            props.put("spring.flyway.password", password);
        }

        boolean hasSsl = finalUrl.contains("sslmode=require") || finalUrl.contains("ssl=true");
        log.info("Configured PostgreSQL datasource from JDBC URL (host: '{}', port: {}, database: '{}', ssl: {})",
                host, port, databaseName, hasSsl);

        return props;
    }

    private Map<String, Object> handleCloudPostgresUrl(String cloudUrl) {
        String username = null;
        String password = null;
        String host = null;
        int port = 5432;
        String databaseName = "postgres";
        String query = null;

        boolean parsed = false;

        // Try URI parsing
        try {
            String normalizedUriString = cloudUrl.startsWith("postgres://")
                    ? "postgresql://" + cloudUrl.substring("postgres://".length())
                    : cloudUrl;

            URI uri = new URI(normalizedUriString);
            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isEmpty()) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                if (parts.length > 1) {
                    password = parts[1];
                }
            }
            host = uri.getHost();
            if (uri.getPort() != -1) {
                port = uri.getPort();
            }
            if (uri.getPath() != null && uri.getPath().length() > 1) {
                databaseName = uri.getPath().substring(1);
            }
            query = uri.getQuery();
            if (host != null && !host.isBlank()) {
                parsed = true;
            }
        } catch (Exception ignored) {}

        // Fallback to regex
        if (!parsed) {
            Matcher matcher = POSTGRES_URL_PATTERN.matcher(cloudUrl);
            if (matcher.matches()) {
                username = matcher.group(1);
                password = matcher.group(2);
                host = matcher.group(3);
                String portStr = matcher.group(4);
                if (portStr != null && !portStr.isBlank()) {
                    try {
                        port = Integer.parseInt(portStr);
                    } catch (NumberFormatException ignored) {}
                }
                String dbStr = matcher.group(5);
                if (dbStr != null && !dbStr.isBlank()) {
                    databaseName = dbStr;
                }
                query = matcher.group(6);
                parsed = (host != null && !host.isBlank());
            }
        }

        if (!parsed || host == null || host.isBlank()) {
            return null;
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                .append(host)
                .append(":")
                .append(port)
                .append("/")
                .append(databaseName);

        if (query != null && !query.isEmpty()) {
            if (!query.contains("sslmode") && !query.contains("ssl=")) {
                jdbcUrl.append("?").append(query).append("&sslmode=require");
            } else {
                jdbcUrl.append("?").append(query);
            }
        } else if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host)) {
            jdbcUrl.append("?sslmode=require");
        }

        String finalJdbcUrl = jdbcUrl.toString();
        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", finalJdbcUrl);
        props.put("spring.flyway.url", finalJdbcUrl);
        if (username != null) {
            props.put("spring.datasource.username", username);
            props.put("spring.flyway.user", username);
        }
        if (password != null) {
            props.put("spring.datasource.password", password);
            props.put("spring.flyway.password", password);
        }

        boolean hasSsl = finalJdbcUrl.contains("sslmode=require") || finalJdbcUrl.contains("ssl=true");
        log.info("Configured production PostgreSQL datasource from cloud URL (host: '{}', port: {}, database: '{}', ssl: {})",
                host, port, databaseName, hasSsl);

        return props;
    }

    private boolean isProductionProfileActive(ConfigurableEnvironment environment) {
        for (String profile : environment.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        String profilesProp = environment.getProperty("spring.profiles.active");
        if (profilesProp != null && (profilesProp.contains("prod") || profilesProp.contains("production"))) {
            return true;
        }
        String envProfile = System.getenv("SPRING_PROFILES_ACTIVE");
        return envProfile != null && (envProfile.contains("prod") || envProfile.contains("production"));
    }
}
