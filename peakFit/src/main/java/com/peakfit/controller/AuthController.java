package com.peakfit.controller;

import com.peakfit.dto.*;
import com.peakfit.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mirrors Node.js routes/auth.js
 *
 * POST  /api/auth/register  — public
 * POST  /api/auth/login     — public
 * GET   /api/auth/me        — protected
 * PUT   /api/auth/profile   — protected
 * PUT   /api/auth/password  — protected
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        return ResponseEntity.ok(authService.getMe(userId(auth)));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(Authentication auth,
                                                              @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateProfile(userId(auth), req));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication auth,
                                                               @RequestBody ChangePasswordRequest req) {
        return ResponseEntity.ok(authService.changePassword(userId(auth), req));
    }

    // Helper: extract userId stored by JwtAuthFilter as the principal
    private Integer userId(Authentication auth) {
        return (Integer) auth.getPrincipal();
    }
}
