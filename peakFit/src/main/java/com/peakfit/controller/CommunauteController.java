package com.peakfit.controller;

import com.peakfit.service.CommunauteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js routes/other.js (communaute router)
 *
 * GET /api/communaute
 */
@RestController
@RequestMapping("/api/communaute")
public class CommunauteController {

    private final CommunauteService communauteService;

    public CommunauteController(CommunauteService communauteService) {
        this.communauteService = communauteService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCommunaute(Authentication auth) {
        return ResponseEntity.ok(communauteService.getCommunaute(userId(auth)));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
