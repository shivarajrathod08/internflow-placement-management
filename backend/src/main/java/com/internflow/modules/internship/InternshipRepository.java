package com.internflow.modules.internship;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long>, JpaSpecificationExecutor<Internship> {
    Page<Internship> findByCompanyId(Long companyId, Pageable pageable);
    List<Internship> findByCompanyId(Long companyId);
    Page<Internship> findByStatus(InternshipStatus status, Pageable pageable);
    long countByStatus(InternshipStatus status);
    long countByCompanyId(Long companyId);
}
