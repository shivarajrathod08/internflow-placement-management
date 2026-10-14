package com.internflow.modules.skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByCanonicalNameIgnoreCase(String canonicalName);
    boolean existsByCanonicalNameIgnoreCase(String canonicalName);
    List<Skill> findByCategory(String category);

    @Query("SELECT s FROM Skill s WHERE LOWER(s.canonicalName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Skill> searchByName(@Param("query") String query);
}
