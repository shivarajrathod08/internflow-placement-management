package com.internflow.modules.skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkillAliasRepository extends JpaRepository<SkillAlias, Long> {
    Optional<SkillAlias> findByAliasNameIgnoreCase(String aliasName);
    boolean existsByAliasNameIgnoreCase(String aliasName);
}
