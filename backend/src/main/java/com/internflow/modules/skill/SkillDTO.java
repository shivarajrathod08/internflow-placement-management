package com.internflow.modules.skill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillDTO {
    private Long id;
    private String canonicalName;
    private String category;
    private String description;
    private List<String> aliases;

    public static SkillDTO from(Skill skill) {
        List<String> aliasList = skill.getAliases() != null
                ? skill.getAliases().stream().map(SkillAlias::getAliasName).toList()
                : List.of();

        return SkillDTO.builder()
                .id(skill.getId())
                .canonicalName(skill.getCanonicalName())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .aliases(aliasList)
                .build();
    }
}
