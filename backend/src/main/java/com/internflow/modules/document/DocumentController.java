package com.internflow.modules.document;

import com.internflow.common.ApiResponse;
import com.internflow.common.PageResponse;
import com.internflow.modules.user.Role;
import com.internflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Endpoints for uploading, securely downloading, and verifying internship and student documents")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload a document (resume, offer letter, joining report, completion certificate)")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "applicationId", required = false) Long applicationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        DocumentDTO uploaded = documentService.uploadDocument(userId, applicationId, documentType, file);
        return new ResponseEntity<>(ApiResponse.ok("Document uploaded successfully and queued for verification", uploaded), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Securely download or view an uploaded document")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentUserRole();

        Resource resource = documentService.loadFileAsResource(id, userId, role);
        Document document = documentService.getDocumentEntity(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all documents uploaded by current student")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getMyDocuments() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<DocumentDTO> docs = documentService.getStudentDocuments(userId);
        return ResponseEntity.ok(ApiResponse.ok(docs));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all documents awaiting administrator verification")
    public ResponseEntity<ApiResponse<PageResponse<DocumentDTO>>> getPendingDocuments(
            @PageableDefault(size = 10, sort = "uploadedAt") Pageable pageable) {
        Page<DocumentDTO> page = documentService.getPendingDocuments(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @PostMapping("/admin/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve or reject a document (Admin)")
    public ResponseEntity<ApiResponse<DocumentDTO>> verifyDocument(
            @PathVariable Long id,
            @Valid @RequestBody VerifyDocumentRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        DocumentDTO updated = documentService.verifyDocument(id, request, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Document verification status updated to " + request.getStatus(), updated));
    }
}
