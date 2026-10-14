package com.internflow.modules.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long applicationId;
    private String internshipTitle;
    private DocumentType documentType;
    private String fileName;
    private String downloadUrl;
    private Long fileSize;
    private String mimeType;
    private VerificationStatus verificationStatus;
    private String rejectionReason;
    private LocalDateTime uploadedAt;
    private LocalDateTime verifiedAt;

    public static DocumentDTO from(Document d) {
        return DocumentDTO.builder()
                .id(d.getId())
                .studentId(d.getStudent().getId())
                .studentName(d.getStudent().getFirstName() + " " + d.getStudent().getLastName())
                .applicationId(d.getApplication() != null ? d.getApplication().getId() : null)
                .internshipTitle(d.getApplication() != null ? d.getApplication().getInternship().getTitle() : null)
                .documentType(d.getDocumentType())
                .fileName(d.getFileName())
                .downloadUrl("/api/documents/" + d.getId() + "/download")
                .fileSize(d.getFileSize())
                .mimeType(d.getMimeType())
                .verificationStatus(d.getVerificationStatus())
                .rejectionReason(d.getRejectionReason())
                .uploadedAt(d.getUploadedAt())
                .verifiedAt(d.getVerifiedAt())
                .build();
    }
}
