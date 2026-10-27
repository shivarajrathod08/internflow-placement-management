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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Normalizes PostgreSQL connection URLs from cloud platforms like Render, Supabase, Neon, and Railway.
 * Translates URLs in format "postgres://user:pass@host:port/dbname" or "postgresql://..."
 * into standard Spring Boot JDBC properties ("jdbc:postgresql://...").
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlEnvironmentPostProcessor.class);

    private static final Pattern POSTGRES_URL_PATTERN = Pattern.compile(
            "^(?:postgres(?:ql)?://)(?:([^:@]+)(?::([^@]*))?@)?([^:/?#]+)(?::([0-9]+))?(?:/([^?#]*))?(?:\\?(.*))?$"
    );

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
            String username = null;
            String password = null;
            String host = null;
            int port = 5432;
            String databaseName = "postgres";
            String query = null;

            boolean parsed = false;

            // 1. Try URI parsing
            try {
                String normalizedUriString = rawDatabaseUrl.startsWith("postgres://")
                        ? "postgresql://" + rawDatabaseUrl.substring("postgres://".length())
                        : rawDatabaseUrl;

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
                String path = uri.getPath();
                if (path != null && path.length() > 1) {
                    databaseName = path.substring(1);
                }
                query = uri.getQuery();
                if (host != null && !host.isBlank()) {
                    parsed = true;
                }
            } catch (Exception ex) {
                log.debug("Standard URI parser failed on '{}', falling back to regex: {}", rawDatabaseUrl, ex.getMessage());
            }

            // 2. Regex fallback for non-standard or special-character credentials
            if (!parsed) {
                Matcher matcher = POSTGRES_URL_PATTERN.matcher(rawDatabaseUrl);
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
                    parsed = true;
                }
            }

            if (parsed && host != null && !host.isBlank()) {
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

                Map<String, Object> props = new HashMap<>();
                props.put("spring.datasource.url", jdbcUrl.toString());
                if (username != null) {
                    props.put("spring.datasource.username", username);
                }
                if (password != null) {
                    props.put("spring.datasource.password", password);
                }

                environment.getPropertySources().addFirst(new MapPropertySource("cloudDatabaseUrlProperties", props));
                log.info("Successfully converted cloud DATABASE_URL to JDBC: {} (host: {}, database: {}, ssl: {})",
                        jdbcUrl, host, databaseName, jdbcUrl.toString().contains("sslmode=require"));
            } else {
                log.warn("Unable to parse cloud DATABASE_URL: {}", rawDatabaseUrl);
            }
        }
    }
}
