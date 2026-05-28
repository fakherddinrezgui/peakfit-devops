package com.peakfit.controller;

import com.peakfit.dto.ActivityRequest;
import com.peakfit.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js routes/activities.js
 *
 * GET    /api/activities
 * POST   /api/activities
 * PUT    /api/activities/:id
 * DELETE /api/activities/:id
 */
@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(Authentication auth) {
        return ResponseEntity.ok(activityService.getAll(userId(auth)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(Authentication auth,
                                                       @RequestBody ActivityRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.create(userId(auth), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> update(Authentication auth,
                                                       @PathVariable Integer id,
                                                       @RequestBody ActivityRequest req) {
        return ResponseEntity.ok(activityService.update(userId(auth), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(Authentication auth,
                                                       @PathVariable Integer id) {
        return ResponseEntity.ok(activityService.delete(userId(auth), id));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
