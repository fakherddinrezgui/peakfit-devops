package com.peakfit.service;

import com.peakfit.dto.BlessureRequest;
import com.peakfit.entity.Blessure;
import com.peakfit.entity.ConseilRecuperation;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.ActivityRepository;
import com.peakfit.repository.BlessureRepository;
import com.peakfit.repository.ConseilRecuperationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class RecuperationService {

    private final BlessureRepository blessureRepository;
    private final ConseilRecuperationRepository conseilRepository;
    private final ActivityRepository activityRepository;
    private final JdbcTemplate jdbcTemplate;

    public RecuperationService(BlessureRepository blessureRepository,
                               ConseilRecuperationRepository conseilRepository,
                               ActivityRepository activityRepository,
                               JdbcTemplate jdbcTemplate) {
        this.blessureRepository = blessureRepository;
        this.conseilRepository = conseilRepository;
        this.activityRepository = activityRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    /** GET /api/recuperation */
    public Map<String, Object> getRecuperation(Integer userId) {
        LocalDate today = LocalDate.now();

        List<Blessure> blessures = blessureRepository.findByUserIdOrderByDebutDesc(userId);
        List<ConseilRecuperation> conseils = conseilRepository.findByUserIdAndDate(userId, today);

        // Sleep data derived from activities (last 7 days) — same logic as Node.js
        List<Map<String, Object>> sommeil = jdbcTemplate.query(
            "SELECT DATE_FORMAT(day,'%a') as jour, AVG(duree_min/60) as heures " +
            "FROM activities WHERE user_id=? AND day >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
            "GROUP BY day ORDER BY day",
            (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("jour", rs.getString("jour"));
                double h = rs.getDouble("heures");
                m.put("heures", Math.round(h * 10.0) / 10.0);
                return m;
            }, userId
        );

        long totalActs = activityRepository.countByUserId(userId);
        int scoreRecup = (int) Math.min(100, Math.round((totalActs / 35.0) * 100));

        // Map blessures
        List<Map<String, Object>> blessureList = new ArrayList<>();
        for (Blessure b : blessures) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", b.getId());
            m.put("user_id", b.getUserId());
            m.put("zone", b.getZone());
            m.put("severite", b.getSeverite());
            m.put("debut", b.getDebut().toString());
            m.put("date_fin", b.getDateFin() != null ? b.getDateFin().toString() : null);
            m.put("guerison", b.getGuerison());
            m.put("notes", b.getNotes());
            m.put("created_at", b.getCreatedAt());
            blessureList.add(m);
        }

        // Map conseils
        List<Map<String, Object>> conseilList = new ArrayList<>();
        for (ConseilRecuperation c : conseils) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("user_id", c.getUserId());
            m.put("date", c.getDate().toString());
            m.put("type", c.getType());
            m.put("titre", c.getTitre());
            m.put("fait", c.getFait());
            conseilList.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("scoreRecup", scoreRecup);
        result.put("conseils", conseilList);
        result.put("blessures", blessureList);
        result.put("sommeil", sommeil);
        return result;
    }

    /** POST /api/recuperation/blessure */
    public Map<String, Object> createBlessure(Integer userId, BlessureRequest req) {
        if (req.getZone() == null || req.getDebut() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "zone et debut requis.");
        }
        Blessure b = new Blessure();
        b.setUserId(userId);
        b.setZone(req.getZone());
        b.setSeverite(req.getSeverite() != null ? req.getSeverite() : "Legere");
        b.setDebut(LocalDate.parse(req.getDebut()));
        b.setNotes(req.getNotes() != null ? req.getNotes() : "");
        Blessure saved = blessureRepository.save(b);
        return Map.of("id", saved.getId());
    }

    /** PUT /api/recuperation/blessure/:id */
    public Map<String, String> updateBlessure(Integer userId, Integer id, BlessureRequest req) {
        Blessure b = blessureRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Blessure introuvable."));
        b.setZone(req.getZone());
        b.setSeverite(req.getSeverite());
        b.setDateFin(req.getDateFin() != null ? LocalDate.parse(req.getDateFin()) : null);
        b.setGuerison(req.getGuerison() != null && req.getGuerison());
        b.setNotes(req.getNotes());
        blessureRepository.save(b);
        return Map.of("message", "Blessure mise à jour.");
    }

    /** PUT /api/recuperation/conseil/:id */
    public Map<String, String> doneConseil(Integer userId, Integer id) {
        ConseilRecuperation c = conseilRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conseil introuvable."));
        c.setFait(true);
        conseilRepository.save(c);
        return Map.of("message", "Conseil marqué fait.");
    }
}
