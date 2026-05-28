package com.peakfit.repository;

import com.peakfit.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {

    List<Activity> findByUserIdOrderByDayDesc(Integer userId);

    Optional<Activity> findByIdAndUserId(Integer id, Integer userId);

    void deleteByIdAndUserId(Integer id, Integer userId);

    // Count all activities for a user
    long countByUserId(Integer userId);

    // Count activities in last 7 days
    @Query(value = "SELECT COUNT(*) FROM activities WHERE user_id = :uid AND day >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)", nativeQuery = true)
    long countWeekActivities(@Param("uid") Integer userId);

    // Count today's activities
    @Query(value = "SELECT COUNT(*) FROM activities WHERE user_id = :uid AND day = CURDATE()", nativeQuery = true)
    long countTodayActivities(@Param("uid") Integer userId);
}
