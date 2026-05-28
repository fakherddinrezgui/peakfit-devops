package com.peakfit.service;

import com.peakfit.dto.*;
import com.peakfit.entity.User;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.UserRepository;
import com.peakfit.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /** POST /api/auth/register */
    public Map<String, Object> register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Cet email est déjà utilisé.");
        }
        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setAge(req.getAge() != null ? req.getAge() : 25);
        user.setTodayScore(0f);
        user.setRole("user");

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId());

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", saved.getId());
        userMap.put("first_name", saved.getFirstName());
        userMap.put("last_name", saved.getLastName());
        userMap.put("email", saved.getEmail());
        userMap.put("age", saved.getAge());
        userMap.put("today_score", 0);
        userMap.put("role", saved.getRole());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("user", userMap);
        return response;
    }

    /** POST /api/auth/login */
    public Map<String, Object> login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
        }

        String token = jwtService.generateToken(user.getId());

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("first_name", user.getFirstName());
        userMap.put("last_name", user.getLastName());
        userMap.put("email", user.getEmail());
        userMap.put("age", user.getAge());
        userMap.put("today_score", user.getTodayScore() != null ? user.getTodayScore() : 0f);
        userMap.put("role", user.getRole() != null ? user.getRole() : "user");
        // Safe createdAt — return as String to avoid serialization issues
        userMap.put("created_at", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("user", userMap);
        return response;
    }

    /** GET /api/auth/me */
    public Map<String, Object> getMe(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("first_name", user.getFirstName());
        result.put("last_name", user.getLastName());
        result.put("email", user.getEmail());
        result.put("age", user.getAge());
        result.put("today_score", user.getTodayScore() != null ? user.getTodayScore() : 0f);
        result.put("created_at", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return result;
    }

    /** PUT /api/auth/profile */
    public Map<String, String> updateProfile(Integer userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName()  != null) user.setLastName(req.getLastName());
        if (req.getAge()       != null) user.setAge(req.getAge());
        if (req.getEmail()     != null) user.setEmail(req.getEmail());
        userRepository.save(user);
        return Map.of("message", "Profil mis à jour.");
    }

    /** PUT /api/auth/password */
    public Map<String, String> changePassword(Integer userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));

        if (!passwordEncoder.matches(req.getCurrent(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Mot de passe actuel incorrect.");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNouveau()));
        userRepository.save(user);
        return Map.of("message", "Mot de passe modifié.");
    }
}