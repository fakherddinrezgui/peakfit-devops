package com.peakfit.controller;

import com.peakfit.dto.BlessureRequest;
import com.peakfit.service.RecuperationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js routes/other.js (recuperation router)
 *
 * GET  /api/recuperation
 * POST /api/recuperation/blessure
 * PUT  /api/recuperation/blessure/:id
 * PUT  /api/recuperation/conseil/:id
 */
@RestController
@RequestMapping("/api/recuperation")
public class RecuperationController {

    private final RecuperationService recuperationService;

    public RecuperationController(RecuperationService recuperationService) {
        this.recuperationService = recuperationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getRecuperation(Authentication auth) {
        return ResponseEntity.ok(recuperationService.getRecuperation(userId(auth)));
    }

    @PostMapping("/blessure")
    public ResponseEntity<Map<String, Object>> createBlessure(Authentication auth,
                                                               @RequestBody BlessureRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recuperationService.createBlessure(userId(auth), req));
    }

    @PutMapping("/blessure/{id}")
    public ResponseEntity<Map<String, String>> updateBlessure(Authentication auth,
                                                               @PathVariable Integer id,
                                                               @RequestBody BlessureRequest req) {
        return ResponseEntity.ok(recuperationService.updateBlessure(userId(auth), id, req));
    }

    @PutMapping("/conseil/{id}")
    public ResponseEntity<Map<String, String>> doneConseil(Authentication auth,
                                                            @PathVariable Integer id) {
        return ResponseEntity.ok(recuperationService.doneConseil(userId(auth), id));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
