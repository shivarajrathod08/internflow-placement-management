package com.internflow.modules.document;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ForbiddenException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.user.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("Document Security & Download Service Tests")
class DocumentServiceTest {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private DocumentRepository documentRepository;

    @Test
    @DisplayName("Student should successfully download their own uploaded resume document")
    void testStudentDownloadOwnDocument() {
        // Document 1 belongs to Student 1 (Alex Rivera, user ID 5)
        Resource resource = documentService.loadFileAsResource(1L, 5L, Role.STUDENT);

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    @DisplayName("Student should be denied (403 Forbidden) when accessing another student's document")
    void testStudentCannotDownloadOtherStudentDocument() {
        // User ID 6 (Emily Watson) attempting to access Document 1 (Alex Rivera)
        assertThrows(ForbiddenException.class, () ->
                documentService.loadFileAsResource(1L, 6L, Role.STUDENT));
    }

    @Test
    @DisplayName("Recruiter should successfully download resume of candidate who applied to their company")
    void testRecruiterCanDownloadApplicantResume() {
        // Alex Rivera (Student 1, Document 1) has applied to Google LLC (Owner user ID 2)
        Resource resource = documentService.loadFileAsResource(1L, 2L, Role.COMPANY);

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    @DisplayName("Recruiter should be denied (403 Forbidden) when candidate has not applied to their company")
    void testRecruiterCannotDownloadNonApplicantResume() {
        // NextGen AI Labs (recruiter user ID 3) has no applications from Alex Rivera (Student 1)
        assertThrows(ForbiddenException.class, () ->
                documentService.loadFileAsResource(1L, 3L, Role.COMPANY));
    }

    @Test
    @DisplayName("Administrator or TPO should have access to student documents")
    void testAdminCanDownloadDocument() {
        // User ID 1 is administrator
        Resource resource = documentService.loadFileAsResource(1L, 1L, Role.ADMIN);

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    @DisplayName("Request for non-existent document should throw ResourceNotFoundException (404)")
    void testNonExistentDocumentThrows404() {
        assertThrows(ResourceNotFoundException.class, () ->
                documentService.loadFileAsResource(999999L, 1L, Role.ADMIN));
    }

    @Test
    @DisplayName("Document with malicious path traversal should be rejected with BadRequestException")
    void testPathTraversalRejected() {
        // Create a test document with path traversal
        Document malicious = Document.builder()
                .student(documentRepository.findById(1L).orElseThrow().getStudent())
                .documentType(DocumentType.RESUME)
                .fileName("traversal.pdf")
                .filePath("../../../etc/passwd")
                .fileSize(100L)
                .mimeType("application/pdf")
                .verificationStatus(VerificationStatus.VERIFIED)
                .build();
        Document saved = documentRepository.save(malicious);

        assertThrows(BadRequestException.class, () ->
                documentService.loadFileAsResource(saved.getId(), 5L, Role.STUDENT));
    }
}
