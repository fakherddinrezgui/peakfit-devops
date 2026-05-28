package com.peakfit.service;

import com.peakfit.dto.ProgrammeRequest;
import com.peakfit.dto.SeanceToggleRequest;
import com.peakfit.entity.Programme;
import com.peakfit.entity.Seance;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.ProgrammeRepository;
import com.peakfit.repository.SeanceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProgrammeService {

    private final ProgrammeRepository programmeRepository;
    private final SeanceRepository seanceRepository;

    public ProgrammeService(ProgrammeRepository programmeRepository,
                            SeanceRepository seanceRepository) {
        this.programmeRepository = programmeRepository;
        this.seanceRepository = seanceRepository;
    }

    /** GET /api/programmes — returns programmes with their seances */
    public List<Map<String, Object>> getAll(Integer userId) {
        List<Programme> progs = programmeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Programme p : progs) {
            List<Seance> seances = seanceRepository.findByProgrammeId(p.getId());

            Map<String, Object> progMap = new LinkedHashMap<>();
            progMap.put("id", p.getId());
            progMap.put("user_id", p.getUserId());
            progMap.put("nom", p.getNom());
            progMap.put("description", p.getDescription());
            progMap.put("objectif", p.getObjectif());
            progMap.put("duree_weeks", p.getDureeWeeks());
            progMap.put("semaine_courante", p.getSemaineCourante());
            progMap.put("created_at", p.getCreatedAt());

            List<Map<String, Object>> seanceList = new ArrayList<>();
            for (Seance s : seances) {
                Map<String, Object> sm = new LinkedHashMap<>();
                sm.put("id", s.getId());
                sm.put("programme_id", s.getProgrammeId());
                sm.put("jour", s.getJour());
                sm.put("titre", s.getTitre());
                sm.put("duree_min", s.getDureeMin());
                sm.put("intensite", s.getIntensite());
                sm.put("fait", s.getFait());
                seanceList.add(sm);
            }
            progMap.put("seances", seanceList);
            result.add(progMap);
        }
        return result;
    }

    /** POST /api/programmes */
    public Map<String, Object> create(Integer userId, ProgrammeRequest req) {
        if (req.getNom() == null || req.getNom().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "nom requis.");
        }
        Programme p = new Programme();
        p.setUserId(userId);
        p.setNom(req.getNom());
        p.setDescription(req.getDescription() != null ? req.getDescription() : "");
        p.setObjectif(req.getObjectif() != null ? req.getObjectif() : "");
        p.setDureeWeeks(req.getDureeWeeks() != null ? req.getDureeWeeks() : 8);
        Programme saved = programmeRepository.save(p);
        return Map.of("id", saved.getId());
    }

    /** PUT /api/programmes/seance/:id */
    public Map<String, String> toggleSeance(Integer id, SeanceToggleRequest req) {
        Seance s = seanceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Séance introuvable."));
        s.setFait(req.getFait() != null && req.getFait());
        seanceRepository.save(s);
        return Map.of("message", "Séance mise à jour.");
    }
}
