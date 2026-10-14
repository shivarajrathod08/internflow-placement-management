package com.internflow.modules.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByStudentIdOrderByOfferDateDesc(Long studentId);
    List<Offer> findByCompanyIdOrderByOfferDateDesc(Long companyId);
    Page<Offer> findAllByOrderByOfferDateDesc(Pageable pageable);
    Optional<Offer> findByApplicationId(Long applicationId);
    boolean existsByApplicationId(Long applicationId);
    long countByStatus(OfferStatus status);
}
