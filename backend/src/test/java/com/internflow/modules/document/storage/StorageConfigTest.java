package com.internflow.modules.document.storage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Storage Configuration Validation Tests")
class StorageConfigTest {

    @Test
    @DisplayName("STORAGE_TYPE=s3 should fail fast when mandatory Cloudflare R2 credentials are missing")
    void testS3MissingCredentialsThrowsException() {
        StorageProperties properties = new StorageProperties();
        properties.setType("s3");
        // All S3 fields are empty/null by default

        StorageConfig config = new StorageConfig(properties);
        LocalStorageService local = new LocalStorageService("./uploads");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                config.storageService(local));

        assertTrue(ex.getMessage().contains("mandatory credentials are missing"));
        assertTrue(ex.getMessage().contains("S3_BUCKET_NAME"));
        assertTrue(ex.getMessage().contains("S3_ENDPOINT"));
        assertTrue(ex.getMessage().contains("S3_ACCESS_KEY_ID"));
        assertTrue(ex.getMessage().contains("S3_SECRET_ACCESS_KEY"));
    }

    @Test
    @DisplayName("STORAGE_TYPE=local should succeed without any S3 credentials")
    void testLocalStorageSucceedsWithoutS3Credentials() {
        StorageProperties properties = new StorageProperties();
        properties.setType("local");

        StorageConfig config = new StorageConfig(properties);
        LocalStorageService local = new LocalStorageService("./uploads");

        StorageService service = config.storageService(local);
        assertNotNull(service);
        assertEquals("LOCAL", service.getStorageType());
    }
}
