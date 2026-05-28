package com.peakfit.repository;

import com.peakfit.entity.Hydratation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface HydratationRepository extends JpaRepository<Hydratation, Integer> {

    Optional<Hydratation> findByUserIdAndDate(Integer userId, LocalDate date);

    @Modifying
    @Query(value =
        "INSERT INTO hydratation (user_id, date, consomme, objectif) VALUES (:uid, :date, :amount, 2.5) " +
        "ON DUPLICATE KEY UPDATE consomme = consomme + :amount",
        nativeQuery = true)
    void upsertHydratation(@Param("uid") Integer userId,
                           @Param("date") LocalDate date,
                           @Param("amount") Float amount);
}
