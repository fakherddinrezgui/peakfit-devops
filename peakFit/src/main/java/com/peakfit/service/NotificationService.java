package com.peakfit.service;

import com.peakfit.entity.Notification;
import com.peakfit.exception.ApiException;
import com.peakfit.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** GET /api/notifications */
    public List<Map<String, Object>> getAll(Integer userId) {
        List<Notification> rows = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Notification n : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", n.getId());
            m.put("user_id", n.getUserId());
            m.put("type", n.getType());
            m.put("titre", n.getTitre());
            m.put("message", n.getMessage());
            m.put("lu", n.getLu());          // boolean (not 0/1)
            m.put("date", n.getCreatedAt()); // "date" alias matching Node.js
            m.put("created_at", n.getCreatedAt());
            result.add(m);
        }
        return result;
    }

    /** PUT /api/notifications/:id/lire */
    public Map<String, String> markRead(Integer userId, Integer id) {
        Notification n = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification introuvable."));
        n.setLu(true);
        notificationRepository.save(n);
        return Map.of("message", "Notification lue.");
    }

    /** PUT /api/notifications/lire-tout */
    @Transactional
    public Map<String, String> markAllRead(Integer userId) {
        notificationRepository.markAllReadByUserId(userId);
        return Map.of("message", "Toutes lues.");
    }
}
