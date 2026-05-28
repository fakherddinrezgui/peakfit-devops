package com.peakfit.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private SecretKey getKey() {
        // Ensure key is exactly 32 bytes (256 bits) for HS256
        // Pad or truncate to meet JJWT minimum key length requirement
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        byte[] paddedKey = Arrays.copyOf(keyBytes, 32);
        return Keys.hmacShaKeyFor(paddedKey);
    }

    public String generateToken(Integer userId) {
        return Jwts.builder()
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    public Integer extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("userId", Integer.class);
    }

    public boolean isValid(String token) {
        try {
            extractUserId(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}