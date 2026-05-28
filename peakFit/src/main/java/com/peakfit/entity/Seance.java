package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seances")
@Data
public class Seance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "programme_id", nullable = false)
    private Integer programmeId;

    @Column(nullable = false, length = 15)
    private String jour;

    @Column(nullable = false, length = 100)
    private String titre;

    @Column(name = "duree_min", nullable = false)
    private Integer dureeMin = 30;

    @Column(nullable = false, length = 20)
    private String intensite = "Moderee";

    @Column(nullable = false)
    private Boolean fait = false;
}
