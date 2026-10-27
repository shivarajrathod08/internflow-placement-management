package com.internflow.modules.document.storage;

import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

/**
 * Pluggable abstraction for document & resume storage.
 * Supports Local Filesystem storage (default/fallback) and Cloudflare R2 / AWS S3 object storage.
 */
public interface StorageService {

    /**
     * Stores a file stream under the given key / path.
     *
     * @param storageKey    relative storage key or file path (e.g. "resume/uuid.pdf")
     * @param inputStream   stream of file bytes
     * @param contentLength size in bytes
     * @param contentType   MIME type
     * @return the persistent storage path / key
     * @throws IOException on I/O error
     */
    String store(String storageKey, InputStream inputStream, long contentLength, String contentType) throws IOException;

    /**
     * Loads a file as a Spring Resource for authenticated download or streaming.
     *
     * @param storageKey path or key
     * @return Spring Resource
     * @throws IOException on I/O error or if not found
     */
    Resource loadAsResource(String storageKey) throws IOException;

    /**
     * Checks if a document exists at the given key.
     */
    boolean exists(String storageKey);

    /**
     * Deletes a stored document.
     */
    void delete(String storageKey) throws IOException;

    /**
     * Identifies the active storage provider ("LOCAL" or "S3").
     */
    String getStorageType();
}
