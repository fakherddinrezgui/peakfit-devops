package com.peakfit.controller;

import com.peakfit.dto.ProgrammeRequest;
import com.peakfit.dto.SeanceToggleRequest;
import com.peakfit.service.ProgrammeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Mirrors Node.js routes/programmes.js
 *
 * GET  /api/programmes
 * POST /api/programmes
 * PUT  /api/programmes/seance/:id
 */
@RestController
@RequestMapping("/api/programmes")
public class ProgrammeController {

    private final ProgrammeService programmeService;

    public ProgrammeController(ProgrammeService programmeService) {
        this.programmeService = programmeService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(Authentication auth) {
        return ResponseEntity.ok(programmeService.getAll(userId(auth)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(Authentication auth,
                                                       @RequestBody ProgrammeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(programmeService.create(userId(auth), req));
    }

    @PutMapping("/seance/{id}")
    public ResponseEntity<Map<String, String>> toggleSeance(@PathVariable Integer id,
                                                             @RequestBody SeanceToggleRequest req) {
        return ResponseEntity.ok(programmeService.toggleSeance(id, req));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
