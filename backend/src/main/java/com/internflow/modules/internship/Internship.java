package com.internflow.modules.internship;

import com.internflow.modules.company.Company;
import com.internflow.modules.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "internships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", nullable = false, length = 50)
    @Builder.Default
    private WorkMode workMode = WorkMode.REMOTE;

    @Column(name = "duration_months", nullable = false)
    @Builder.Default
    private Integer durationMonths = 6;

    @Column(name = "stipend_per_month", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal stipendPerMonth = BigDecimal.ZERO;

    @Column(name = "min_cgpa", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal minCgpa = BigDecimal.ZERO;

    @Column(name = "allowed_branches", length = 255)
    private String allowedBranches;

    @Column(name = "max_backlogs")
    @Builder.Default
    private Integer maxBacklogs = 0;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "application_deadline", nullable = false)
    private LocalDateTime applicationDeadline;

    @Column(nullable = false)
    @Builder.Default
    private Integer openings = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private InternshipStatus status = InternshipStatus.DRAFT;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_admin_id")
    private User approvedByAdmin;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "internship", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InternshipSkill> skills = new ArrayList<>();
}
