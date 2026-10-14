package com.internflow.modules.skill;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillAliasRepository skillAliasRepository;

    @Transactional(readOnly = true)
    public List<SkillDTO> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(SkillDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillDTO> searchSkills(String query) {
        if (query == null || query.isBlank()) {
            return getAllSkills();
        }
        return skillRepository.searchByName(query.trim()).stream()
                .map(SkillDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Skill resolveSkill(String input) {
        if (input == null || input.isBlank()) {
            throw new BadRequestException("Skill query cannot be empty");
        }
        String clean = input.trim();

        // 1. Direct canonical lookup (case-insensitive)
        Optional<Skill> direct = skillRepository.findByCanonicalNameIgnoreCase(clean);
        if (direct.isPresent()) {
            return direct.get();
        }

        // 2. Alias lookup
        Optional<SkillAlias> alias = skillAliasRepository.findByAliasNameIgnoreCase(clean);
        if (alias.isPresent()) {
            return alias.get().getSkill();
        }

        // 3. Fallback: create if missing or throw
        return skillRepository.findByCanonicalNameIgnoreCase(clean)
                .orElseGet(() -> {
                    log.info("Registering newly identified skill: {}", clean);
                    Skill newSkill = Skill.builder()
                            .canonicalName(clean)
                            .category("General")
                            .description("Auto-discovered skill")
                            .build();
                    return skillRepository.save(newSkill);
                });
    }

    @Transactional
    public SkillDTO createSkill(CreateSkillRequest request) {
        if (skillRepository.existsByCanonicalNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Skill already exists: " + request.getName());
        }

        Skill skill = Skill.builder()
                .canonicalName(request.getName().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription())
                .build();

        Skill saved = skillRepository.save(skill);

        if (request.getAliases() != null) {
            for (String alias : request.getAliases()) {
                if (!alias.isBlank() && !skillAliasRepository.existsByAliasNameIgnoreCase(alias.trim())) {
                    SkillAlias skillAlias = SkillAlias.builder()
                            .skill(saved)
                            .aliasName(alias.trim())
                            .build();
                    skillAliasRepository.save(skillAlias);
                    saved.getAliases().add(skillAlias);
                }
            }
        }

        return SkillDTO.from(saved);
    }

    @Transactional
    public void addAlias(Long skillId, String aliasName) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId));

        if (skillAliasRepository.existsByAliasNameIgnoreCase(aliasName.trim())) {
            throw new BadRequestException("Alias already exists: " + aliasName);
        }

        SkillAlias alias = SkillAlias.builder()
                .skill(skill)
                .aliasName(aliasName.trim())
                .build();
        skillAliasRepository.save(alias);
    }
}
