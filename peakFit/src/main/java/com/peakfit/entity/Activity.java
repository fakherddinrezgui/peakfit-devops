package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private LocalDate day;

    @Column(nullable = false, length = 30)
    private String type;

    private Float kilogram = 0f;
    private Integer calories = 0;

    @Column(name = "distance_km")
    private Float distanceKm = 0f;

    @Column(name = "duree_min")
    private Integer dureeMin = 0;

    @Column(name = "vitesse_moy")
    private Float vitesseMoy = 0f;

    @Column(name = "freq_card_moy")
    private Integer freqCardMoy = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
