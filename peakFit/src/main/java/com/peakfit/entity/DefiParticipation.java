package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "defi_participation")
@Data
public class DefiParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "defi_id", nullable = false)
    private Integer defiId;

    @Column(nullable = false)
    private Float progression = 0f;
}
