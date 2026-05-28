package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "user_badges")
@Data
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "badge_id", nullable = false)
    private Integer badgeId;

    @Column(nullable = false)
    private Boolean obtenu = false;

    @Column(name = "date_obtenu")
    private LocalDate dateObtenu;
}
