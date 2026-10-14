package com.internflow.modules.interview;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationIdOrderByScheduledAtDesc(Long applicationId);

    @Query("SELECT i FROM Interview i WHERE i.application.student.id = :studentId ORDER BY i.scheduledAt ASC")
    List<Interview> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT i FROM Interview i WHERE i.application.student.id = :studentId AND i.scheduledAt >= :now ORDER BY i.scheduledAt ASC")
    List<Interview> findUpcomingByStudentId(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);

    @Query("SELECT i FROM Interview i WHERE i.application.internship.company.id = :companyId ORDER BY i.scheduledAt DESC")
    Page<Interview> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.application.internship.company.id = :companyId AND i.scheduledAt >= :now ORDER BY i.scheduledAt ASC")
    List<Interview> findUpcomingByCompanyId(@Param("companyId") Long companyId, @Param("now") LocalDateTime now);

    long countByStatus(InterviewStatus status);
}
