package com.internflow.modules.document;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ForbiddenException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.application.Application;
import com.internflow.modules.application.ApplicationRepository;
import com.internflow.modules.application.ApplicationStatus;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.notification.NotificationService;
import com.internflow.modules.notification.NotificationType;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentRepository;
import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Transactional
    public DocumentDTO uploadDocument(Long userId, Long applicationId, DocumentType type, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        Application application = null;
        if (applicationId != null) {
            application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));
            if (!application.getStudent().getId().equals(student.getId())) {
                throw new ForbiddenException("Cannot attach documents to another student's application");
            }
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file format. Only PDF, PNG, JPEG, and DOCX documents are allowed.");
        }

        // Validate extension
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx);
        }

        // Generate safe randomized filename
        String storedFileName = UUID.randomUUID().toString() + extension;
        Path targetDir = Paths.get(uploadDir, type.name().toLowerCase());

        try {
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Document document = Document.builder()
                    .student(student)
                    .application(application)
                    .documentType(type)
                    .fileName(originalFilename)
                    .filePath(targetPath.toString())
                    .fileSize(file.getSize())
                    .mimeType(contentType)
                    .verificationStatus(VerificationStatus.PENDING)
                    .build();

            Document saved = documentRepository.save(document);

            // Update student resume URL if this is a resume
            if (type == DocumentType.RESUME) {
                student.setResumeUrl("/api/documents/" + saved.getId() + "/download");
                studentRepository.save(student);
            }

            // If this is completion document, advance application stage to COMPLETION_SUBMITTED
            if (application != null && (type == DocumentType.COMPLETION_CERTIFICATE || type == DocumentType.EVALUATION_REPORT)) {
                if (application.getCurrentStatus() == ApplicationStatus.IN_PROGRESS) {
                    application.setCurrentStatus(ApplicationStatus.COMPLETION_SUBMITTED);
                    applicationRepository.save(application);
                }
            }

            auditService.log("UPLOAD_DOCUMENT", "Document", saved.getId(), null, "PENDING",
                    String.format("Student uploaded %s (%s)", type, originalFilename));

            return DocumentDTO.from(saved);
        } catch (IOException ex) {
            log.error("Could not store file", ex);
            throw new BadRequestException("Failed to store file securely: " + ex.getMessage());
        }
    }

    @Transactional
    public DocumentDTO verifyDocument(Long docId, VerifyDocumentRequest request, Long adminId) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", docId));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", adminId));

        VerificationStatus oldStatus = document.getVerificationStatus();
        document.setVerificationStatus(request.getStatus());
        document.setRejectionReason(request.getRejectionReason());
        document.setVerifiedByAdmin(admin);
        document.setVerifiedAt(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        // If completion document is approved, application status can be moved to COMPLETED
        if (request.getStatus() == VerificationStatus.VERIFIED && document.getApplication() != null &&
                (document.getDocumentType() == DocumentType.COMPLETION_CERTIFICATE || document.getDocumentType() == DocumentType.EVALUATION_REPORT)) {
            Application app = document.getApplication();
            if (app.getCurrentStatus() == ApplicationStatus.COMPLETION_SUBMITTED ||
                    app.getCurrentStatus() == ApplicationStatus.VERIFICATION_PENDING) {
                app.setCurrentStatus(ApplicationStatus.COMPLETED);
                applicationRepository.save(app);
            }
        }

        auditService.log(
                "ADMIN_VERIFY_DOCUMENT",
                "Document",
                saved.getId(),
                oldStatus.name(),
                request.getStatus().name(),
                request.getStatus() == VerificationStatus.VERIFIED ? "Document verified" : "Rejected: " + request.getRejectionReason()
        );

        // Notify student
        notificationService.createNotification(
                document.getStudent().getUser().getId(),
                request.getStatus() == VerificationStatus.VERIFIED ? "Document Verified! ✅" : "Document Rejected ⚠️",
                String.format("Your %s document '%s' was %s by administrator.%s",
                        document.getDocumentType(),
                        document.getFileName(),
                        request.getStatus(),
                        request.getRejectionReason() != null ? " Reason: " + request.getRejectionReason() : ""),
                request.getStatus() == VerificationStatus.VERIFIED ? NotificationType.SUCCESS : NotificationType.WARNING,
                "/student/documents"
        );

        return DocumentDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long docId, Long userId, Role role) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", docId));

        // Authorization check
        if (role == Role.STUDENT) {
            if (!document.getStudent().getUser().getId().equals(userId)) {
                throw new ForbiddenException("You can only access your own documents");
            }
        } else if (role == Role.COMPANY) {
            if (document.getApplication() != null) {
                Long companyOwnerId = document.getApplication().getInternship().getCompany().getUser().getId();
                if (!companyOwnerId.equals(userId)) {
                    throw new ForbiddenException("Access denied to candidate document");
                }
            }
        }

        try {
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on storage: " + document.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path invalid");
        }
    }

    @Transactional(readOnly = true)
    public Document getDocumentEntity(Long docId) {
        return documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", docId));
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> getStudentDocuments(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return documentRepository.findByStudentId(student.getId()).stream().map(DocumentDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<DocumentDTO> getPendingDocuments(Pageable pageable) {
        return documentRepository.findByVerificationStatus(VerificationStatus.PENDING, pageable).map(DocumentDTO::from);
    }
}
