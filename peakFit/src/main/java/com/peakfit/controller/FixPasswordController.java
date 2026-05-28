package com.peakfit.controller;

import com.peakfit.entity.User;
import com.peakfit.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoint temporaire pour corriger les mots de passe PLACEHOLDER.
 * Même logique que le fixPasswords() de server.js Node.js.
 * Appelez GET /api/fix-passwords UNE SEULE FOIS puis supprimez ce fichier.
 */
@RestController
public class FixPasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public FixPasswordController(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/api/fix-passwords")
    public Map<String, Object> fixPasswords() {
        List<User> users = userRepository.findAll();
        int fixed = 0;

        for (User u : users) {
            String hash = u.getPasswordHash();
            boolean ok = hash != null
                    && (hash.startsWith("$2b$") || hash.startsWith("$2a$"))
                    && hash.length() >= 59
                    && !hash.equals("PLACEHOLDER");

            if (!ok) {
                u.setPasswordHash(passwordEncoder.encode("peakfit123"));
                userRepository.save(u);
                fixed++;
            }
        }

        return Map.of(
            "message", fixed + " mot(s) de passe corrigé(s) → peakfit123",
            "fixed", fixed,
            "total", users.size()
        );
    }
}
