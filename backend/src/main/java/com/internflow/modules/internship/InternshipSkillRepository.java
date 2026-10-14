package com.internflow.modules.internship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipSkillRepository extends JpaRepository<InternshipSkill, Long> {
    List<InternshipSkill> findByInternshipId(Long internshipId);
    void deleteByInternshipId(Long internshipId);
}
