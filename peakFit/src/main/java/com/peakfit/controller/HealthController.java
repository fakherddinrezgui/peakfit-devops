package com.peakfit.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js: app.get('/api/health', ...)
 * Public endpoint — no authentication required.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "ok",  true,
            "app", "PeakFit",
            "v",   "2.0.0"
        ));
    }
}
