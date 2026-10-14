package com.internflow.modules.skill;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_aliases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "alias_name", nullable = false, unique = true, length = 100)
    private String aliasName;
}
