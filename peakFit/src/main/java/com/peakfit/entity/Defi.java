package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "defis")
@Data
public class Defi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String titre;

    @Column(nullable = false)
    private Float total;

    @Column(nullable = false, length = 20)
    private String unite;

    @Column(nullable = false)
    private Integer participants = 1;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
