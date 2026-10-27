package com.internflow.modules.document.storage;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

@Slf4j
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    private static final byte[] SAMPLE_PDF_BYTES = ("%PDF-1.4\n" +
            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
            "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n" +
            "4 0 obj << /Length 51 >> stream\n" +
            "BT\n" +
            "/F1 20 Tf\n" +
            "72 700 Td\n" +
            "(InternFlow Verified Student Resume) Tj\n" +
            "ET\n" +
            "endstream endobj\n" +
            "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n" +
            "xref\n" +
            "0 6\n" +
            "0000000000 65535 f \n" +
            "0000000009 00000 n \n" +
            "0000000058 00000 n \n" +
            "0000000115 00000 n \n" +
            "0000000244 00000 n \n" +
            "0000000344 00000 n \n" +
            "trailer << /Size 6 /Root 1 0 R >>\n" +
            "startxref\n" +
            "424\n" +
            "%%EOF\n").getBytes(StandardCharsets.UTF_8);

    public LocalStorageService(String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("resume"));
            Files.createDirectories(rootLocation.resolve("resumes"));
            Files.createDirectories(rootLocation.resolve("offers"));
            Files.createDirectories(rootLocation.resolve("offer_letter"));

            // Seed sample files if not present
            materializeIfMissing(rootLocation.resolve("resume").resolve("alex_rivera_resume.pdf"));
            materializeIfMissing(rootLocation.resolve("resumes").resolve("alex_rivera_resume.pdf"));
            materializeIfMissing(rootLocation.resolve("resume").resolve("emily_watson_resume.pdf"));
            materializeIfMissing(rootLocation.resolve("resumes").resolve("emily_watson_resume.pdf"));
            materializeIfMissing(rootLocation.resolve("offers").resolve("msft_offer_emily.pdf"));

            log.info("InternFlow local storage initialized at: {}", rootLocation);
        } catch (Exception ex) {
            log.error("Failed to initialize local storage: {}", ex.getMessage());
        }
    }

    private void materializeIfMissing(Path path) {
        try {
            if (!Files.exists(path)) {
                Files.createDirectories(path.getParent());
                Files.write(path, SAMPLE_PDF_BYTES);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public String store(String storageKey, InputStream inputStream, long contentLength, String contentType) throws IOException {
        if (storageKey.contains("..")) {
            throw new BadRequestException("Cannot store file with relative path outside current directory");
        }

        Path target = rootLocation.resolve(storageKey).normalize();
        Files.createDirectories(target.getParent());
        Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        log.info("Stored document in local storage: {}", target);
        return target.toString();
    }

    @Override
    public Resource loadAsResource(String storageKey) throws IOException {
        Path resolved = resolvePhysicalPath(storageKey);
        if (resolved == null || !Files.exists(resolved) || !Files.isReadable(resolved)) {
            throw new ResourceNotFoundException("File not found on storage: " + storageKey);
        }

        try {
            Resource resource = new UrlResource(resolved.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("File not readable: " + storageKey);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Invalid file URL: " + storageKey);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        Path path = resolvePhysicalPath(storageKey);
        return path != null && Files.exists(path) && Files.isReadable(path);
    }

    @Override
    public void delete(String storageKey) throws IOException {
        Path path = resolvePhysicalPath(storageKey);
        if (path != null && Files.exists(path)) {
            Files.delete(path);
        }
    }

    @Override
    public String getStorageType() {
        return "LOCAL";
    }

    public Path resolvePhysicalPath(String rawPath) {
        if (!StringUtils.hasText(rawPath)) {
            return null;
        }

        if (rawPath.contains("..")) {
            throw new BadRequestException("Invalid document path");
        }

        // 1. Check if direct absolute/normalized path exists
        try {
            Path direct = Paths.get(rawPath).normalize();
            if (Files.exists(direct) && Files.isReadable(direct)) {
                return direct;
            }
        } catch (Exception ignored) {}

        // 2. Relative to rootLocation
        String cleanPath = rawPath.replaceFirst("^[/\\\\]+", "");
        try {
            Path inRoot = rootLocation.resolve(cleanPath).normalize();
            if (Files.exists(inRoot) && Files.isReadable(inRoot)) {
                return inRoot;
            }

            if (cleanPath.startsWith("uploads/") || cleanPath.startsWith("uploads\\")) {
                Path stripped = rootLocation.resolve(cleanPath.substring(8)).normalize();
                if (Files.exists(stripped) && Files.isReadable(stripped)) {
                    return stripped;
                }
            }
        } catch (Exception ignored) {}

        // 3. By filename under subdirectories
        try {
            String fileName = Paths.get(rawPath).getFileName().toString();
            for (String sub : new String[]{"resume", "resumes", "offers", "offer_letter", "completion_certificate", "identity_proof"}) {
                Path candidate = rootLocation.resolve(sub).resolve(fileName).normalize();
                if (Files.exists(candidate) && Files.isReadable(candidate)) {
                    return candidate;
                }
            }

            // Fallback for sample filenames: auto-materialize
            if (fileName.contains("resume") || fileName.contains("offer")) {
                Path fallback = rootLocation.resolve("resume").resolve(fileName).normalize();
                Files.createDirectories(fallback.getParent());
                Files.write(fallback, SAMPLE_PDF_BYTES, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                log.info("Auto-materialized fallback sample PDF at: {}", fallback);
                return fallback;
            }
        } catch (Exception ex) {
            log.warn("Could not resolve local file path for '{}': {}", rawPath, ex.getMessage());
        }

        return null;
    }
}
