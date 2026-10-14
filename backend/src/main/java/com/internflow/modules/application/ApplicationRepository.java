package com.internflow.modules.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByInternshipIdAndStudentId(Long internshipId, Long studentId);
    boolean existsByInternshipIdAndStudentId(Long internshipId, Long studentId);

    Page<Application> findByStudentId(Long studentId, Pageable pageable);
    List<Application> findByStudentId(Long studentId);

    Page<Application> findByInternshipId(Long internshipId, Pageable pageable);
    List<Application> findByInternshipId(Long internshipId);

    @Query("SELECT a FROM Application a WHERE a.internship.company.id = :companyId")
    Page<Application> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.internship.company.id = :companyId AND a.currentStatus = :status")
    Page<Application> findByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") ApplicationStatus status, Pageable pageable);

    Page<Application> findByCurrentStatus(ApplicationStatus status, Pageable pageable);

    long countByCurrentStatus(ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.internship.company.id = :companyId")
    long countByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.internship.company.id = :companyId AND a.currentStatus = :status")
    long countByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") ApplicationStatus status);
}
