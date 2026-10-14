package com.internflow.modules.internship;

import com.internflow.modules.skill.Skill;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "internship_skills", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"internship_id", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private boolean required = true;
}
