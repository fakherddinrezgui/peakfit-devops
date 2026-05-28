package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "hydratation")
@Data
public class Hydratation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Float consomme = 0f;

    @Column(nullable = false)
    private Float objectif = 2.5f;
}
