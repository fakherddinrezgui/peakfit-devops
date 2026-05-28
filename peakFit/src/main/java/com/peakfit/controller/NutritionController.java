package com.peakfit.controller;

import com.peakfit.dto.HydratationRequest;
import com.peakfit.dto.NutritionRepasRequest;
import com.peakfit.service.NutritionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js routes/nutrition.js
 *
 * GET    /api/nutrition
 * POST   /api/nutrition/repas
 * DELETE /api/nutrition/repas/:id
 * POST   /api/nutrition/hydratation
 */
@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNutrition(Authentication auth) {
        return ResponseEntity.ok(nutritionService.getNutrition(userId(auth)));
    }

    @PostMapping("/repas")
    public ResponseEntity<Map<String, Object>> addRepas(Authentication auth,
                                                         @RequestBody NutritionRepasRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nutritionService.addRepas(userId(auth), req));
    }

    @DeleteMapping("/repas/{id}")
    public ResponseEntity<Map<String, String>> deleteRepas(Authentication auth,
                                                            @PathVariable Integer id) {
        return ResponseEntity.ok(nutritionService.deleteRepas(userId(auth), id));
    }

    @PostMapping("/hydratation")
    public ResponseEntity<Map<String, String>> addHydratation(Authentication auth,
                                                               @RequestBody HydratationRequest req) {
        return ResponseEntity.ok(nutritionService.addHydratation(userId(auth), req));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
