package com.peakfit.repository;

import com.peakfit.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Integer> {

    @Query(value =
        "SELECT b.id, b.nom, b.icone, b.descr, ub.obtenu, ub.date_obtenu " +
        "FROM badges b " +
        "LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = :uid " +
        "ORDER BY b.id",
        nativeQuery = true)
    List<Object[]> findBadgesWithUserStatus(@Param("uid") Integer userId);
}
