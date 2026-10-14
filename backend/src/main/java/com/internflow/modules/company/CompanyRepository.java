package com.internflow.modules.company;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    Page<Company> findByVerificationStatus(CompanyVerificationStatus status, Pageable pageable);
    List<Company> findByVerificationStatus(CompanyVerificationStatus status);
    long countByVerificationStatus(CompanyVerificationStatus status);
}
