package com.internflow.modules.document.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

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

        boolean isS3Configured = StringUtils.hasText(s3.getBucket()) &&
                (StringUtils.hasText(s3.getAccessKey()) || "s3".equalsIgnoreCase(storageType));

        if ("s3".equalsIgnoreCase(storageType) || isS3Configured) {
            log.info("Configuring S3/Cloudflare R2 Object Storage (bucket: {}, endpoint: {})", s3.getBucket(), s3.getEndpoint());
            try {
                S3ClientBuilder builder = S3Client.builder();

                // Custom S3 / Cloudflare R2 endpoint
                if (StringUtils.hasText(s3.getEndpoint())) {
                    builder.endpointOverride(URI.create(s3.getEndpoint()));
                }

                // Region: R2 uses "auto" or "us-east-1"
                String regionName = StringUtils.hasText(s3.getRegion()) ? s3.getRegion() : "auto";
                builder.region(Region.of(regionName));

                // Credentials
                if (StringUtils.hasText(s3.getAccessKey()) && StringUtils.hasText(s3.getSecretKey())) {
                    builder.credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())
                    ));
                } else {
                    builder.credentialsProvider(DefaultCredentialsProvider.create());
                }

                // Path style access (essential for Cloudflare R2 and MinIO)
                builder.serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(s3.isPathStyleAccess())
                        .build());

                S3Client s3Client = builder.build();
                return new S3StorageService(s3Client, s3.getBucket(), localStorageService);
            } catch (Exception ex) {
                log.error("Failed to initialize S3 storage client, falling back to LocalStorageService: {}", ex.getMessage());
                return localStorageService;
            }
        }

        log.info("Using LocalStorageService for document storage (type: local)");
        return localStorageService;
    }
}
