package com.peakfit.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CommunauteService {

    private final JdbcTemplate jdbcTemplate;

    public CommunauteService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** GET /api/communaute */
    public Map<String, Object> getCommunaute(Integer userId) {

        // ── Classement ────────────────────────────────────────────
        List<Map<String, Object>> classement = jdbcTemplate.query(
            "SELECT u.id, u.first_name, u.last_name, COUNT(a.id) as activites, SUM(a.calories) as points " +
            "FROM users u LEFT JOIN activities a ON a.user_id = u.id AND MONTH(a.day)=MONTH(CURDATE()) " +
            "GROUP BY u.id ORDER BY points DESC LIMIT 10",
            (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("rang", i + 1);
                m.put("nom", rs.getString("first_name") + " " + rs.getString("last_name"));
                m.put("activites", rs.getLong("activites"));
                long pts = rs.getLong("points");
                m.put("points", rs.wasNull() ? 0 : pts);
                m.put("moi", rs.getInt("id") == userId);
                return m;
            }
        );

        // ── Badges ────────────────────────────────────────────────
        List<Map<String, Object>> badges = jdbcTemplate.query(
            "SELECT b.id, b.nom, b.icone, b.descr, ub.obtenu, ub.date_obtenu " +
            "FROM badges b LEFT JOIN user_badges ub ON ub.badge_id=b.id AND ub.user_id=? " +
            "ORDER BY b.id",
            (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", rs.getInt("id"));
                m.put("nom", rs.getString("nom"));
                m.put("icone", rs.getString("icone"));
                m.put("desc", rs.getString("descr"));   // Node.js maps "descr" → "desc"
                m.put("descr", rs.getString("descr"));
                boolean obtenu = rs.getInt("obtenu") == 1 && !rs.wasNull();
                m.put("obtenu", obtenu);
                m.put("date_obtenu", rs.getString("date_obtenu"));
                return m;
            }, userId
        );

        // ── Défis ─────────────────────────────────────────────────
        List<Map<String, Object>> defis = jdbcTemplate.query(
            "SELECT d.*, dp.progression FROM defis d " +
            "LEFT JOIN defi_participation dp ON dp.defi_id=d.id AND dp.user_id=? " +
            "ORDER BY d.actif DESC",
            (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", rs.getInt("id"));
                m.put("titre", rs.getString("titre"));
                m.put("total", rs.getFloat("total"));
                m.put("unite", rs.getString("unite"));
                m.put("participants", rs.getInt("participants"));
                m.put("actif", rs.getInt("actif") == 1);
                m.put("created_at", rs.getObject("created_at"));
                float prog = rs.getFloat("progression");
                m.put("progression", rs.wasNull() ? 0 : prog);
                return m;
            }, userId
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("classement", classement);
        result.put("badges", badges);
        result.put("defis", defis);
        return result;
    }
}
