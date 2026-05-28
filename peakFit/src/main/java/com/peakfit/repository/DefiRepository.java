package com.peakfit.repository;

import com.peakfit.entity.Defi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DefiRepository extends JpaRepository<Defi, Integer> {

    @Query(value =
        "SELECT d.*, dp.progression FROM defis d " +
        "LEFT JOIN defi_participation dp ON dp.defi_id = d.id AND dp.user_id = :uid " +
        "ORDER BY d.actif DESC",
        nativeQuery = true)
    List<Object[]> findDefisWithProgression(@Param("uid") Integer userId);
}
