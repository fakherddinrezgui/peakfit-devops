package com.peakfit.controller;

import com.peakfit.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js routes/stats.js
 *
 * GET /api/stats
 */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        return ResponseEntity.ok(statsService.getStats(userId(auth)));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
