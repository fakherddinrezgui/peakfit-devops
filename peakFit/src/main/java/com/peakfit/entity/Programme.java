package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "programmes")
@Data
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description = "";

    @Column(length = 50)
    private String objectif = "";

    @Column(name = "duree_weeks", nullable = false)
    private Integer dureeWeeks = 8;

    @Column(name = "semaine_courante", nullable = false)
    private Integer semaineCourante = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
