package com.peakfit.service;

import com.peakfit.dto.ActivityRequest;
import com.peakfit.entity.Activity;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.ActivityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class ActivityService {

    private static final Map<String, String> TYPE_COLORS = Map.of(
        "Course",   "#E60000",
        "Velo",     "#FF6B35",
        "Natation", "#4895EF",
        "Muscu",    "#7209B7",
        "Yoga",     "#4CC9F0"
    );

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    /** GET /api/activities — returns { sessions, types } */
    public Map<String, Object> getAll(Integer userId) {
        List<Activity> rows = activityRepository.findByUserIdOrderByDayDesc(userId);

        // Build aggregated types map
        Map<String, Map<String, Object>> typesMap = new LinkedHashMap<>();
        for (Activity a : rows) {
            typesMap.computeIfAbsent(a.getType(), t -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("type", t);
                m.put("count", 0);
                m.put("calories", 0);
                m.put("distanceKm", 0.0);
                return m;
            });
            Map<String, Object> t = typesMap.get(a.getType());
            t.put("count", (int) t.get("count") + 1);
            t.put("calories", (int) t.get("calories") + a.getCalories());
            t.put("distanceKm", (double) t.get("distanceKm") + a.getDistanceKm());
        }
        List<Map<String, Object>> types = new ArrayList<>();
        for (Map<String, Object> t : typesMap.values()) {
            t.put("couleur", TYPE_COLORS.getOrDefault((String) t.get("type"), "#888"));
            types.add(t);
        }

        // Build sessions list
        List<Map<String, Object>> sessions = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            Activity a = rows.get(i);
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("day",         a.getDay().toString());
            s.put("index",       i + 1);
            s.put("kilogram",    a.getKilogram() != null ? a.getKilogram() : 0.0);
            s.put("calories",    a.getCalories() != null ? a.getCalories() : 0);
            s.put("distanceKm",  a.getDistanceKm() != null ? a.getDistanceKm() : 0.0);
            s.put("dureeMin",    a.getDureeMin() != null ? a.getDureeMin() : 0);
            s.put("type",        a.getType());
            s.put("vitesseMoy",  a.getVitesseMoy() != null ? a.getVitesseMoy() : 0.0);
            s.put("freqCardMoy", a.getFreqCardMoy() != null ? a.getFreqCardMoy() : 0);
            s.put("id",          a.getId());
            sessions.add(s);
        }

        return Map.of("sessions", sessions, "types", types);
    }

    /** POST /api/activities */
    public Map<String, Object> create(Integer userId, ActivityRequest req) {
        if (req.getDay() == null || req.getType() == null || req.getDureeMin() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "day, type et duree_min sont requis.");
        }
        Activity a = new Activity();
        a.setUserId(userId);
        a.setDay(LocalDate.parse(req.getDay()));
        a.setType(req.getType());
        a.setKilogram(req.getKilogram() != null ? req.getKilogram() : 0f);
        a.setCalories(req.getCalories() != null ? req.getCalories() : 0);
        a.setDistanceKm(req.getDistanceKm() != null ? req.getDistanceKm() : 0f);
        a.setDureeMin(req.getDureeMin());
        a.setVitesseMoy(req.getVitesseMoy() != null ? req.getVitesseMoy() : 0f);
        a.setFreqCardMoy(req.getFreqCardMoy() != null ? req.getFreqCardMoy() : 0);
        Activity saved = activityRepository.save(a);
        return Map.of("id", saved.getId(), "message", "Activité ajoutée.");
    }

    /** PUT /api/activities/:id */
    public Map<String, String> update(Integer userId, Integer id, ActivityRequest req) {
        Activity a = activityRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Activité introuvable."));
        a.setDay(LocalDate.parse(req.getDay()));
        a.setType(req.getType());
        a.setKilogram(req.getKilogram() != null ? req.getKilogram() : 0f);
        a.setCalories(req.getCalories() != null ? req.getCalories() : 0);
        a.setDistanceKm(req.getDistanceKm() != null ? req.getDistanceKm() : 0f);
        a.setDureeMin(req.getDureeMin());
        a.setVitesseMoy(req.getVitesseMoy() != null ? req.getVitesseMoy() : 0f);
        a.setFreqCardMoy(req.getFreqCardMoy() != null ? req.getFreqCardMoy() : 0);
        activityRepository.save(a);
        return Map.of("message", "Activité modifiée.");
    }

    /** DELETE /api/activities/:id */
    @Transactional
    public Map<String, String> delete(Integer userId, Integer id) {
        activityRepository.deleteByIdAndUserId(id, userId);
        return Map.of("message", "Activité supprimée.");
    }
}
