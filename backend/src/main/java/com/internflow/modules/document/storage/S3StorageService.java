package com.internflow.modules.document.storage;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;

/**
 * Cloudflare R2 / AWS S3 compatible object storage implementation.
 * Provides private, secure, highly available document storage with optional local fallback.
 */
@Slf4j
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final String bucketName;
    private final LocalStorageService localFallback;

    public S3StorageService(S3Client s3Client, String bucketName, LocalStorageService localFallback) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.localFallback = localFallback;
        log.info("Initialized S3/R2 storage service with bucket: {}", bucketName);
    }

    private String normalizeKey(String rawKey) {
        if (rawKey == null || rawKey.isBlank()) {
            throw new BadRequestException("Storage key cannot be blank");
        }
        if (rawKey.contains("..")) {
            throw new BadRequestException("Invalid path traversal in storage key");
        }
        // Normalize slashes and strip leading slashes
        String clean = rawKey.replace('\\', '/').replaceAll("^/+", "");
        // If key begins with uploads/, strip it for clean bucket hierarchy
        if (clean.startsWith("uploads/")) {
            clean = clean.substring("uploads/".length());
        }
        return clean;
    }

    @Override
    public String store(String storageKey, InputStream inputStream, long contentLength, String contentType) throws IOException {
        String key = normalizeKey(storageKey);
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .contentLength(contentLength)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, contentLength));
            log.info("Successfully stored document to S3/R2: s3://{}/{}", bucketName, key);
            return key;
        } catch (Exception ex) {
            log.error("Failed to upload document to S3/R2 bucket '{}' key '{}': {}", bucketName, key, ex.getMessage());
            throw new IOException("Failed to store file to object storage: " + ex.getMessage(), ex);
        }
    }

    @Override
    public Resource loadAsResource(String storageKey) throws IOException {
        String key = normalizeKey(storageKey);
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(getRequest);
            String fileName = Paths.get(key).getFileName().toString();
            long contentLength = s3Stream.response().contentLength();

            return new InputStreamResource(s3Stream, fileName) {
                @Override
                public long contentLength() {
                    return contentLength;
                }

                @Override
                public String getFilename() {
                    return fileName;
                }
            };
        } catch (NoSuchKeyException ex) {
            log.warn("Document key '{}' not found in S3 bucket '{}', checking local fallback...", key, bucketName);
            if (localFallback != null && localFallback.exists(storageKey)) {
                return localFallback.loadAsResource(storageKey);
            }
            throw new ResourceNotFoundException("File not found in object storage: " + key);
        } catch (Exception ex) {
            log.error("Error retrieving document from S3/R2 key '{}': {}", key, ex.getMessage());
            if (localFallback != null && localFallback.exists(storageKey)) {
                return localFallback.loadAsResource(storageKey);
            }
            throw new ResourceNotFoundException("Error loading document from object storage: " + ex.getMessage());
        }
    }

    @Override
    public boolean exists(String storageKey) {
        String key = normalizeKey(storageKey);
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(key).build());
            return true;
        } catch (NoSuchKeyException e) {
            return localFallback != null && localFallback.exists(storageKey);
        } catch (Exception e) {
            return localFallback != null && localFallback.exists(storageKey);
        }
    }

    @Override
    public void delete(String storageKey) throws IOException {
        String key = normalizeKey(storageKey);
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
            log.info("Deleted object from S3/R2: s3://{}/{}", bucketName, key);
        } catch (Exception ex) {
            log.warn("Failed to delete object from S3/R2: {}", ex.getMessage());
        }
        if (localFallback != null && localFallback.exists(storageKey)) {
            localFallback.delete(storageKey);
        }
    }

    @Override
    public String getStorageType() {
        return "S3";
    }
}
