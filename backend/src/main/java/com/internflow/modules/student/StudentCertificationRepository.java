package com.internflow.modules.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCertificationRepository extends JpaRepository<StudentCertification, Long> {
    List<StudentCertification> findByStudentId(Long studentId);
}
