package com.peakfit.repository;

import com.peakfit.entity.Objectif;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ObjectifRepository extends JpaRepository<Objectif, Integer> {
    List<Objectif> findByUserIdOrderByCreatedAtDesc(Integer userId);
    Optional<Objectif> findByIdAndUserId(Integer id, Integer userId);
    void deleteByIdAndUserId(Integer id, Integer userId);
}
