package com.peakfit.repository;

import com.peakfit.entity.NutritionRepas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NutritionRepasRepository extends JpaRepository<NutritionRepas, Integer> {

    List<NutritionRepas> findByUserIdAndDateOrderByHeure(Integer userId, LocalDate date);

    Optional<NutritionRepas> findByIdAndUserId(Integer id, Integer userId);

    @Query(value =
        "SELECT DATE_FORMAT(date,'%a') as jour, SUM(calories) as calories " +
        "FROM nutrition_repas " +
        "WHERE user_id = :uid AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
        "GROUP BY date ORDER BY date",
        nativeQuery = true)
    List<Object[]> findWeeklySummary(@Param("uid") Integer userId);
}
