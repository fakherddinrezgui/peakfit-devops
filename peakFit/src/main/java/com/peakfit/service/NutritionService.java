package com.peakfit.service;

import com.peakfit.dto.HydratationRequest;
import com.peakfit.dto.NutritionRepasRequest;
import com.peakfit.entity.Hydratation;
import com.peakfit.entity.NutritionRepas;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.HydratationRepository;
import com.peakfit.repository.NutritionRepasRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class NutritionService {

    private final NutritionRepasRepository repasRepository;
    private final HydratationRepository hydratationRepository;

    public NutritionService(NutritionRepasRepository repasRepository,
                            HydratationRepository hydratationRepository) {
        this.repasRepository = repasRepository;
        this.hydratationRepository = hydratationRepository;
    }

    /** GET /api/nutrition */
    public Map<String, Object> getNutrition(Integer userId) {
        LocalDate today = LocalDate.now();

        List<NutritionRepas> repas = repasRepository.findByUserIdAndDateOrderByHeure(userId, today);

        // Weekly summary
        List<Object[]> semaineRaw = repasRepository.findWeeklySummary(userId);
        List<Map<String, Object>> semaine = new ArrayList<>();
        for (Object[] row : semaineRaw) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("jour", row[0]);
            m.put("calories", row[1]);
            semaine.add(m);
        }

        // Totals
        int totalCal = repas.stream().mapToInt(r -> r.getCalories() != null ? r.getCalories() : 0).sum();
        Map<String, Object> macros = new LinkedHashMap<>();
        macros.put("proteines", repas.stream().mapToDouble(r -> r.getProteines() != null ? r.getProteines() : 0).sum());
        macros.put("glucides",  repas.stream().mapToDouble(r -> r.getGlucides()  != null ? r.getGlucides()  : 0).sum());
        macros.put("lipides",   repas.stream().mapToDouble(r -> r.getLipides()   != null ? r.getLipides()   : 0).sum());

        // Hydration
        Hydratation hydra = hydratationRepository.findByUserIdAndDate(userId, today).orElse(null);
        Map<String, Object> hydratation = new LinkedHashMap<>();
        hydratation.put("consomme", hydra != null ? hydra.getConsomme() : 0.0);
        hydratation.put("objectif", hydra != null ? hydra.getObjectif() : 2.5);

        // Build repas list (return raw entity fields)
        List<Map<String, Object>> repasList = new ArrayList<>();
        for (NutritionRepas r : repas) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("user_id", r.getUserId());
            m.put("date", r.getDate().toString());
            m.put("heure", r.getHeure());
            m.put("type", r.getType());
            m.put("nom", r.getNom());
            m.put("calories", r.getCalories());
            m.put("proteines", r.getProteines());
            m.put("glucides", r.getGlucides());
            m.put("lipides", r.getLipides());
            m.put("created_at", r.getCreatedAt());
            repasList.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("objectifCalories", 2600);
        result.put("consommeCalories", totalCal);
        result.put("repas", repasList);
        result.put("macros", macros);
        result.put("objectifMacros", Map.of("proteines", 195, "glucides", 300, "lipides", 80));
        result.put("hydratation", hydratation);
        result.put("semaine", semaine);
        return result;
    }

    /** POST /api/nutrition/repas */
    public Map<String, Object> addRepas(Integer userId, NutritionRepasRequest req) {
        if (req.getNom() == null || req.getType() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "nom et type requis.");
        }
        NutritionRepas r = new NutritionRepas();
        r.setUserId(userId);
        r.setDate(req.getDate() != null ? LocalDate.parse(req.getDate()) : LocalDate.now());
        r.setHeure(req.getHeure() != null ? req.getHeure() : "12:00");
        r.setType(req.getType());
        r.setNom(req.getNom());
        r.setCalories(req.getCalories() != null ? req.getCalories() : 0);
        r.setProteines(req.getProteines() != null ? req.getProteines() : 0f);
        r.setGlucides(req.getGlucides() != null ? req.getGlucides() : 0f);
        r.setLipides(req.getLipides() != null ? req.getLipides() : 0f);
        NutritionRepas saved = repasRepository.save(r);
        return Map.of("id", saved.getId());
    }

    /** DELETE /api/nutrition/repas/:id */
    public Map<String, String> deleteRepas(Integer userId, Integer id) {
        repasRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Repas introuvable."));
        repasRepository.deleteById(id);
        return Map.of("message", "Repas supprimé.");
    }

    /** POST /api/nutrition/hydratation */
    @Transactional
    public Map<String, String> addHydratation(Integer userId, HydratationRequest req) {
        int ml = req.getMl() != null ? req.getMl() : 250;
        float liters = ml / 1000f;
        hydratationRepository.upsertHydratation(userId, LocalDate.now(), liters);
        return Map.of("message", "Hydratation mise à jour.");
    }
}
