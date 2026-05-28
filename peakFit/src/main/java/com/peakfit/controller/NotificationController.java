package com.peakfit.controller;

import com.peakfit.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Mirrors Node.js routes/notifications.js
 *
 * GET /api/notifications
 * PUT /api/notifications/:id/lire
 * PUT /api/notifications/lire-tout
 *
 * IMPORTANT: /lire-tout must be declared BEFORE /:id/lire
 * so Spring doesn't try to parse "lire-tout" as an Integer id.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(Authentication auth) {
        return ResponseEntity.ok(notificationService.getAll(userId(auth)));
    }

    // Must be declared BEFORE /{id}/lire to avoid routing conflict
    @PutMapping("/lire-tout")
    public ResponseEntity<Map<String, String>> markAllRead(Authentication auth) {
        return ResponseEntity.ok(notificationService.markAllRead(userId(auth)));
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<Map<String, String>> markRead(Authentication auth,
                                                         @PathVariable Integer id) {
        return ResponseEntity.ok(notificationService.markRead(userId(auth), id));
    }

    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
