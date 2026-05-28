package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "blessures")
@Data
public class Blessure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, length = 50)
    private String zone;

    @Column(nullable = false, length = 20)
    private String severite = "Legere";

    @Column(nullable = false)
    private LocalDate debut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(nullable = false)
    private Boolean guerison = false;

    @Column(columnDefinition = "TEXT")
    private String notes = "";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
