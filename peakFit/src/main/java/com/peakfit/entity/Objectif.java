package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "objectifs")
@Data
public class Objectif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, length = 100)
    private String titre;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(name = "type_activite", length = 30)
    private String typeActivite = "Tous";

    @Column(nullable = false)
    private Float cible;

    @Column(nullable = false)
    private Float actuel = 0f;

    @Column(nullable = false, length = 20)
    private String unite = "";

    @Column(nullable = false, length = 20)
    private String statut = "en_cours";

    @Column(length = 10)
    private String couleur = "#E60000";

    @Column(name = "date_fin", length = 20)
    private String dateFin;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
