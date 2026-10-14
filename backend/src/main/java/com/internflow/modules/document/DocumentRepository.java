package com.internflow.modules.document;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByStudentId(Long studentId);
    List<Document> findByApplicationId(Long applicationId);
    Page<Document> findByVerificationStatus(VerificationStatus status, Pageable pageable);
    long countByVerificationStatus(VerificationStatus status);
}
