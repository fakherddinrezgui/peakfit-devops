package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "badges")
@Data
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, length = 5)
    private String icone;

    @Column(nullable = false, length = 100)
    private String descr;
}
