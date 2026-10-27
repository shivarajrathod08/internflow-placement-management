package com.internflow.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.support.SpringFactoriesLoader;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Production DATABASE_URL Configuration & Precedence Tests")
class DatabaseUrlEnvironmentPostProcessorTest {

    private final DatabaseUrlEnvironmentPostProcessor processor = new DatabaseUrlEnvironmentPostProcessor();
    private final SpringApplication application = new SpringApplication();

    @Test
    @DisplayName("Should convert Render external postgresql:// URL to JDBC with SSL, credentials, and Flyway")
    void testRenderExternalPostgresUrl() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "postgresql://internflow_user:secret_pass123@dpg-abc12345-a.oregon-postgres.render.com:5432/internflow_db")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://dpg-abc12345-a.oregon-postgres.render.com:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("jdbc:postgresql://dpg-abc12345-a.oregon-postgres.render.com:5432/internflow_db?sslmode=require",
                env.getProperty("spring.flyway.url"));
        assertEquals("internflow_user", env.getProperty("spring.datasource.username"));
        assertEquals("secret_pass123", env.getProperty("spring.datasource.password"));
        assertEquals("internflow_user", env.getProperty("spring.flyway.user"));
        assertEquals("secret_pass123", env.getProperty("spring.flyway.password"));
        assertEquals("org.postgresql.Driver", env.getProperty("spring.datasource.driver-class-name"));

        // Prove it does NOT fall back to localhost:5432
        assertFalse(env.getProperty("spring.datasource.url").contains("localhost:5432"));
    }

    @Test
    @DisplayName("Should convert Render internal postgres:// URL to JDBC with SSL and default port")
    void testRenderInternalPostgresUrl() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "postgres://internflow_user:my_secret_pass@dpg-abc12345-a:5432/internflow_db")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://dpg-abc12345-a:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("jdbc:postgresql://dpg-abc12345-a:5432/internflow_db?sslmode=require",
                env.getProperty("spring.flyway.url"));
        assertEquals("internflow_user", env.getProperty("spring.datasource.username"));
        assertEquals("my_secret_pass", env.getProperty("spring.datasource.password"));
        assertEquals("org.postgresql.Driver", env.getProperty("spring.datasource.driver-class-name"));

        assertFalse(env.getProperty("spring.datasource.url").contains("localhost:5432"));
    }

    @Test
    @DisplayName("Should convert Render URL without explicit port to default port 5432 and SSL")
    void testRenderUrlWithoutExplicitPort() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "postgresql://user:pass@dpg-abc12345-a.oregon-postgres.render.com/internflow_db")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://dpg-abc12345-a.oregon-postgres.render.com:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("user", env.getProperty("spring.datasource.username"));
        assertEquals("pass", env.getProperty("spring.datasource.password"));
        assertEquals("org.postgresql.Driver", env.getProperty("spring.datasource.driver-class-name"));
    }

    @Test
    @DisplayName("Should decode URL-encoded special characters in password")
    void testRenderUrlWithUrlEncodedPassword() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "postgresql://user:p%40ss%23word%21@dpg-abc12345-a:5432/internflow_db")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://dpg-abc12345-a:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("user", env.getProperty("spring.datasource.username"));
        assertEquals("p@ss#word!", env.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should preserve existing query parameters and not duplicate sslmode")
    void testRenderUrlPreservesQueryParams() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "postgresql://user:pass@remote-host:5432/internflow_db?sslmode=verify-full&connectTimeout=10")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://remote-host:5432/internflow_db?sslmode=verify-full&connectTimeout=10",
                env.getProperty("spring.datasource.url"));
    }

    @Test
    @DisplayName("Should correctly accept already formatted JDBC URL and bind Flyway without resetting to localhost")
    void testStandardJdbcUrlConfigured() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "jdbc:postgresql://ep-summer-sunset-123.us-east-2.aws.neon.tech/internflow_db?sslmode=require")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://ep-summer-sunset-123.us-east-2.aws.neon.tech/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("jdbc:postgresql://ep-summer-sunset-123.us-east-2.aws.neon.tech/internflow_db?sslmode=require",
                env.getProperty("spring.flyway.url"));
        assertEquals("org.postgresql.Driver", env.getProperty("spring.datasource.driver-class-name"));

        assertFalse(env.getProperty("spring.datasource.url").contains("localhost:5432"));
    }

    @Test
    @DisplayName("Should extract embedded credentials from jdbc:postgresql://user:pass@host/db URL")
    void testJdbcUrlWithEmbeddedCredentials() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("testEnv",
                Map.of("DATABASE_URL", "jdbc:postgresql://cloud_user:secret_pw@remote-pg-host.com:5432/internflow_db")));

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://remote-pg-host.com:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("cloud_user", env.getProperty("spring.datasource.username"));
        assertEquals("secret_pw", env.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should verify DatabaseUrlEnvironmentPostProcessor is registered in META-INF/spring.factories")
    void testSpringFactoriesRegistration() {
        var factories = SpringFactoriesLoader.loadFactoryNames(
                org.springframework.boot.env.EnvironmentPostProcessor.class,
                getClass().getClassLoader()
        );
        assertTrue(factories.contains("com.internflow.config.DatabaseUrlEnvironmentPostProcessor"),
                "DatabaseUrlEnvironmentPostProcessor must be registered in META-INF/spring.factories so Spring Boot discovers it at runtime");
    }

    @Test
    @DisplayName("Should fail fast with sanitized error when prod profile is active but DATABASE_URL is missing")
    void testProductionFailsWhenDatabaseUrlMissing() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.setActiveProfiles("prod");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                processor.postProcessEnvironment(env, application));

        assertTrue(ex.getMessage().contains("Production database configuration is missing"));
        assertTrue(ex.getMessage().contains("DATABASE_URL must be provided in the production environment"));
        assertFalse(ex.getMessage().contains("password"));
    }

    @Test
    @DisplayName("Should NOT fail when local profile is active and DATABASE_URL is missing")
    void testLocalProfilePermitsMissingDatabaseUrl() {
        ConfigurableEnvironment env = new StandardEnvironment();
        env.setActiveProfiles("local");

        assertDoesNotThrow(() -> processor.postProcessEnvironment(env, application));
        assertNull(env.getProperty("spring.datasource.url"));
    }
}
