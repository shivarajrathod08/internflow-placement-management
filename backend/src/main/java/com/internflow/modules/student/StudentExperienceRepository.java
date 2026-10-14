package com.internflow.modules.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentExperienceRepository extends JpaRepository<StudentExperience, Long> {
    List<StudentExperience> findByStudentId(Long studentId);
}
