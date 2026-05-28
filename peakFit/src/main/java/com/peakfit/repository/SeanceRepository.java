package com.peakfit.repository;

import com.peakfit.entity.Seance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeanceRepository extends JpaRepository<Seance, Integer> {
    List<Seance> findByProgrammeId(Integer programmeId);
}
