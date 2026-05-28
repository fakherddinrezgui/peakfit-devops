package com.peakfit.controller;

import com.peakfit.dto.ObjectifRequest;
import com.peakfit.entity.Objectif;
import com.peakfit.service.ObjectifService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Mirrors Node.js routes/objectifs.js
 *
 * GET    /api/objectifs
 * POST   /api/objectifs
 * PUT    /api/objectifs/:id
 * DELETE /api/objectifs/:id
 */
@RestController
@RequestMapping("/api/objectifs")
public class ObjectifController {

    private final ObjectifService objectifService;

    public ObjectifController(ObjectifService objectifService) {
        this.objectifService = objectifService;
    }

    @GetMapping
    public ResponseEntity<List<Objectif>> getAll(Authentication auth) {
        return ResponseEntity.ok(objectifService.getAll(userId(auth)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(Authentication auth,
                                                       @RequestBody ObjectifRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(objectifService.create(userId(auth), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> update(Authentication auth,
                                                       @PathVariable Integer id,
                                                       @RequestBody ObjectifRequest req) {
        return ResponseEntity.ok(objectifService.update(userId(auth), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(Authentication auth,
                                                       @PathVariable Integer id) {
        return ResponseEntity.ok(objectifService.delete(userId(auth), id));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
