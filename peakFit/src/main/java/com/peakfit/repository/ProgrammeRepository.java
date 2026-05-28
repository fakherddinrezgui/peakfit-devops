package com.peakfit.repository;

import com.peakfit.entity.Programme;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgrammeRepository extends JpaRepository<Programme, Integer> {
    List<Programme> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
