package com.internflow.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.StandardEnvironment;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Cloud DATABASE_URL PostProcessor Tests")
class DatabaseUrlEnvironmentPostProcessorTest {

    private final DatabaseUrlEnvironmentPostProcessor processor = new DatabaseUrlEnvironmentPostProcessor();
    private final SpringApplication application = new SpringApplication();

    @Test
    @DisplayName("Should convert Render external postgresql:// URL to JDBC with SSL")
    void testRenderExternalPostgresUrl() {
        ConfigurableEnvironment env = new StandardEnvironment();
        System.setProperty("DATABASE_URL", "postgresql://internflow_user:secret_pass123@dpg-abc12345-a.oregon-postgres.render.com:5432/internflow_db");

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://dpg-abc12345-a.oregon-postgres.render.com:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("internflow_user", env.getProperty("spring.datasource.username"));
        assertEquals("secret_pass123", env.getProperty("spring.datasource.password"));

        System.clearProperty("DATABASE_URL");
    }

    @Test
    @DisplayName("Should convert Render internal postgres:// URL to JDBC")
    void testRenderInternalPostgresUrl() {
        ConfigurableEnvironment env = new StandardEnvironment();
        System.setProperty("DATABASE_URL", "postgres://internflow_user:password@dpg-abc12345-a:5432/internflow_db");

        processor.postProcessEnvironment(env, application);

        assertEquals("jdbc:postgresql://dpg-abc12345-a:5432/internflow_db?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("internflow_user", env.getProperty("spring.datasource.username"));
        assertEquals("password", env.getProperty("spring.datasource.password"));

        System.clearProperty("DATABASE_URL");
    }

    @Test
    @DisplayName("Should preserve existing JDBC URL without alteration")
    void testStandardJdbcUrlIgnored() {
        ConfigurableEnvironment env = new StandardEnvironment();
        System.setProperty("DATABASE_URL", "jdbc:postgresql://localhost:5432/testdb");

        processor.postProcessEnvironment(env, application);

        assertNull(env.getProperty("spring.datasource.url"));

        System.clearProperty("DATABASE_URL");
    }
}
