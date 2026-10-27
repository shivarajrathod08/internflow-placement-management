package com.internflow.modules.document.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class StorageConfig {

    private final StorageProperties properties;

    @Value("${app.upload.dir:./uploads}")
    private String legacyUploadDir;

    @Bean
    public LocalStorageService localStorageService() {
        String dir = StringUtils.hasText(properties.getLocal().getDir())
                ? properties.getLocal().getDir()
                : legacyUploadDir;
        return new LocalStorageService(dir);
    }

    @Bean
    @Primary
    public StorageService storageService(LocalStorageService localStorageService) {
        String storageType = properties.getType();
        StorageProperties.S3Properties s3 = properties.getS3();

        if ("s3".equalsIgnoreCase(storageType)) {
            // Strict validation: STORAGE_TYPE=s3 requires all Cloudflare R2 credentials
            List<String> missing = new ArrayList<>();
            if (!StringUtils.hasText(s3.getBucket())) {
                missing.add("S3_BUCKET_NAME (app.storage.s3.bucket)");
            }
            if (!StringUtils.hasText(s3.getEndpoint())) {
                missing.add("S3_ENDPOINT (app.storage.s3.endpoint)");
            }
            if (!StringUtils.hasText(s3.getAccessKey())) {
                missing.add("S3_ACCESS_KEY_ID (app.storage.s3.access-key)");
            }
            if (!StringUtils.hasText(s3.getSecretKey())) {
                missing.add("S3_SECRET_ACCESS_KEY (app.storage.s3.secret-key)");
            }

            if (!missing.isEmpty()) {
                String errorMsg = "STORAGE_TYPE is configured as 's3' (Cloudflare R2 Object Storage), " +
                        "but the following mandatory credentials are missing: " + missing + ". " +
                        "Please configure these environment variables in your Render Dashboard. " +
                        "Alternatively, set STORAGE_TYPE=local to use container local storage.";
                log.error("Fatal Storage Configuration Error: {}", errorMsg);
                throw new IllegalStateException(errorMsg);
            }

            log.info("Configuring S3/Cloudflare R2 Object Storage (bucket: {}, endpoint: {})", s3.getBucket(), s3.getEndpoint());
            try {
                S3ClientBuilder builder = S3Client.builder();
                builder.endpointOverride(URI.create(s3.getEndpoint()));

                String regionName = StringUtils.hasText(s3.getRegion()) ? s3.getRegion() : "auto";
                builder.region(Region.of(regionName));

                builder.credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())
                ));

                builder.serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(s3.isPathStyleAccess())
                        .build());

                S3Client s3Client = builder.build();
                return new S3StorageService(s3Client, s3.getBucket(), localStorageService);
            } catch (Exception ex) {
                log.error("Failed to initialize S3 storage client: {}", ex.getMessage());
                throw new IllegalStateException("Failed to initialize Cloudflare R2 S3 storage client: " + ex.getMessage(), ex);
            }
        }

        log.info("Using LocalStorageService for document storage (type: {})", storageType);
        return localStorageService;
    }
}
