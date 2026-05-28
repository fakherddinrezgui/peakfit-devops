package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "conseils_recuperation")
@Data
public class ConseilRecuperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false, length = 100)
    private String titre;

    @Column(nullable = false)
    private Boolean fait = false;
}
