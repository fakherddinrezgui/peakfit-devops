package com.peakfit.repository;

import com.peakfit.entity.ConseilRecuperation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ConseilRecuperationRepository extends JpaRepository<ConseilRecuperation, Integer> {
    List<ConseilRecuperation> findByUserIdAndDate(Integer userId, LocalDate date);
    Optional<ConseilRecuperation> findByIdAndUserId(Integer id, Integer userId);
}
