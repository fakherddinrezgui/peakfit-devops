package com.peakfit.repository;

import com.peakfit.entity.Blessure;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BlessureRepository extends JpaRepository<Blessure, Integer> {
    List<Blessure> findByUserIdOrderByDebutDesc(Integer userId);
    Optional<Blessure> findByIdAndUserId(Integer id, Integer userId);
}
