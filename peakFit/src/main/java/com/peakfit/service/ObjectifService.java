package com.peakfit.service;

import com.peakfit.dto.ObjectifRequest;
import com.peakfit.entity.Objectif;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.ObjectifRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ObjectifService {

    private final ObjectifRepository objectifRepository;

    public ObjectifService(ObjectifRepository objectifRepository) {
        this.objectifRepository = objectifRepository;
    }

    public List<Objectif> getAll(Integer userId) {
        return objectifRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> create(Integer userId, ObjectifRequest req) {
        if (req.getTitre() == null || req.getType() == null || req.getCible() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "titre, type et cible requis.");
        }
        Objectif o = new Objectif();
        o.setUserId(userId);
        o.setTitre(req.getTitre());
        o.setType(req.getType());
        o.setTypeActivite(req.getTypeActivite() != null ? req.getTypeActivite() : "Tous");
        o.setCible(req.getCible());
        o.setActuel(req.getActuel() != null ? req.getActuel() : 0f);
        o.setUnite(req.getUnite() != null ? req.getUnite() : "");
        o.setStatut(req.getStatut() != null ? req.getStatut() : "en_cours");
        o.setCouleur(req.getCouleur() != null ? req.getCouleur() : "#E60000");
        o.setDateFin(req.getDateFin());
        Objectif saved = objectifRepository.save(o);
        return Map.of("id", saved.getId(), "message", "Objectif créé.");
    }

    public Map<String, String> update(Integer userId, Integer id, ObjectifRequest req) {
        Objectif o = objectifRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Objectif introuvable."));
        o.setTitre(req.getTitre());
        o.setType(req.getType());
        o.setTypeActivite(req.getTypeActivite());
        o.setCible(req.getCible());
        o.setActuel(req.getActuel());
        o.setUnite(req.getUnite());
        o.setStatut(req.getStatut());
        o.setCouleur(req.getCouleur());
        o.setDateFin(req.getDateFin());
        objectifRepository.save(o);
        return Map.of("message", "Objectif modifié.");
    }

    @Transactional
    public Map<String, String> delete(Integer userId, Integer id) {
        objectifRepository.deleteByIdAndUserId(id, userId);
        return Map.of("message", "Objectif supprimé.");
    }
}
