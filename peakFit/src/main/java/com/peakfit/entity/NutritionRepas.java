package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_repas")
@Data
public class NutritionRepas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 10)
    private String heure = "12:00";

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false)
    private Integer calories = 0;

    private Float proteines = 0f;
    private Float glucides = 0f;
    private Float lipides = 0f;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
