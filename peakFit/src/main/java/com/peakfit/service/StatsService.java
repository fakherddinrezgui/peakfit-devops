package com.peakfit.service;

import com.peakfit.repository.ActivityRepository;
import com.peakfit.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StatsService {

    private final JdbcTemplate jdbcTemplate;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public StatsService(JdbcTemplate jdbcTemplate,
                        ActivityRepository activityRepository,
                        UserRepository userRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    /** GET /api/stats — full dashboard stats, matches Node.js response exactly */
    public Map<String, Object> getStats(Integer userId) {

        // ── Totals all-time ──────────────────────────────────────
        Map<String, Object> total = jdbcTemplate.queryForMap(
            "SELECT COUNT(*) as activites, " +
            "COALESCE(ROUND(SUM(distance_km),1),0) as distanceKm, " +
            "COALESCE(SUM(calories),0) as calories, " +
            "COALESCE(ROUND(SUM(duree_min)/60,1),0) as dureeH, " +
            "COALESCE(ROUND(AVG(freq_card_moy),0),0) as fcMoyenne, " +
            "COALESCE(ROUND(AVG(vitesse_moy),1),0) as vitesseMoyenne " +
            "FROM activities WHERE user_id=?", userId);

        // ── Current month ─────────────────────────────────────────
        Map<String, Object> mois = jdbcTemplate.queryForMap(
            "SELECT COUNT(*) as activites, " +
            "COALESCE(ROUND(SUM(distance_km),1),0) as distanceKm, " +
            "COALESCE(SUM(calories),0) as calories, " +
            "COALESCE(ROUND(SUM(duree_min)/60,1),0) as dureeH " +
            "FROM activities WHERE user_id=? AND MONTH(day)=MONTH(CURDATE()) AND YEAR(day)=YEAR(CURDATE())",
            userId);

        // ── Previous month ────────────────────────────────────────
        Map<String, Object> prevMois = jdbcTemplate.queryForMap(
            "SELECT COUNT(*) as activites, " +
            "COALESCE(ROUND(SUM(distance_km),1),0) as distanceKm, " +
            "COALESCE(SUM(calories),0) as calories " +
            "FROM activities WHERE user_id=? " +
            "AND MONTH(day)=MONTH(DATE_SUB(CURDATE(),INTERVAL 1 MONTH)) " +
            "AND YEAR(day)=YEAR(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))",
            userId);

        // ── Monthly evolution (last 12 months) ───────────────────
        List<Map<String, Object>> monthly = jdbcTemplate.queryForList(
            "SELECT DATE_FORMAT(day,'%b %Y') as mois, " +
            "DATE_FORMAT(day,'%Y-%m') as moisKey, " +
            "ROUND(SUM(distance_km),1) as distanceKm, " +
            "SUM(calories) as calories, " +
            "COUNT(*) as activites, " +
            "ROUND(SUM(duree_min)/60,1) as dureeH " +
            "FROM activities WHERE user_id=? AND day >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) " +
            "GROUP BY DATE_FORMAT(day,'%Y-%m') ORDER BY MIN(day)",
            userId);

        // ── Radar performance (6 axes) ────────────────────────────
        List<Map<String, Object>> performance = jdbcTemplate.queryForList(
            "SELECT 'Cardio' as kind, LEAST(ROUND(AVG(freq_card_moy)/2,0),100) as value " +
            "  FROM activities WHERE user_id=? AND freq_card_moy>0 " +
            "UNION " +
            "SELECT 'Endurance', LEAST(ROUND(AVG(duree_min)/1.2,0),100) FROM activities WHERE user_id=? " +
            "UNION " +
            "SELECT 'Vitesse', LEAST(ROUND(AVG(vitesse_moy)*5,0),100) FROM activities WHERE user_id=? AND vitesse_moy>0 " +
            "UNION " +
            "SELECT 'Force', LEAST(COUNT(*)*8,100) FROM activities WHERE user_id=? AND type='Muscu' " +
            "UNION " +
            "SELECT 'Régularité', LEAST(COUNT(*)*5,100) FROM activities WHERE user_id=? AND day >= DATE_SUB(CURDATE(),INTERVAL 30 DAY) " +
            "UNION " +
            "SELECT 'Intensité', LEAST(ROUND(AVG(calories/NULLIF(duree_min,0))*15,0),100) FROM activities WHERE user_id=? AND duree_min>0",
            userId, userId, userId, userId, userId, userId);

        // Ensure values are non-negative
        List<Map<String, Object>> perfCleaned = new ArrayList<>();
        for (Map<String, Object> p : performance) {
            Map<String, Object> m = new LinkedHashMap<>(p);
            Object val = m.get("value");
            if (val == null) m.put("value", 0);
            else {
                double d = ((Number) val).doubleValue();
                m.put("value", Math.max(d, 0));
            }
            perfCleaned.add(m);
        }

        // ── Average session by day-of-week ────────────────────────
        String[] days = {"Dim","Lun","Mar","Mer","Jeu","Ven","Sam"};
        List<Map<String, Object>> avgSessions = jdbcTemplate.query(
            "SELECT DAYOFWEEK(day) as dayNum, ROUND(AVG(duree_min),0) as sessionLength " +
            "FROM activities WHERE user_id=? GROUP BY DAYOFWEEK(day) ORDER BY dayNum",
            (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                int dayNum = rs.getInt("dayNum");
                m.put("dayWeek", dayNum >= 1 && dayNum <= 7 ? days[dayNum - 1] : "Lun");
                m.put("sessionLength", rs.getLong("sessionLength"));
                return m;
            }, userId);

        // ── Personal records by type ──────────────────────────────
        List<Map<String, Object>> records = jdbcTemplate.queryForList(
            "SELECT type, MAX(distance_km) as maxDist, MAX(calories) as maxCal, " +
            "MAX(duree_min) as maxDur, MAX(vitesse_moy) as maxVit, MAX(freq_card_moy) as maxFC " +
            "FROM activities WHERE user_id=? GROUP BY type", userId);

        // ── Today's score ─────────────────────────────────────────
        long weekAct  = activityRepository.countWeekActivities(userId);
        long todayAct = activityRepository.countTodayActivities(userId);
        double todayScore = Math.min(1.0, (weekAct / 5.0) * 0.6 + (todayAct > 0 ? 0.4 : 0));
        double roundedScore = Math.round(todayScore * 100.0) / 100.0;
        jdbcTemplate.update("UPDATE users SET today_score=? WHERE id=?", (float) roundedScore, userId);

        // ── Type stats (current month) ────────────────────────────
        List<Map<String, Object>> typeStats = jdbcTemplate.queryForList(
            "SELECT type, COUNT(*) as count, SUM(calories) as calories, ROUND(SUM(distance_km),1) as distance " +
            "FROM activities WHERE user_id=? AND MONTH(day)=MONTH(CURDATE()) " +
            "GROUP BY type ORDER BY count DESC", userId);

        // ── Assemble response ─────────────────────────────────────
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total",          total);
        result.put("mois",           mois);
        result.put("prevMois",       prevMois);
        result.put("monthly",        monthly);
        result.put("performance",    perfCleaned);
        result.put("averageSession", avgSessions);
        result.put("records",        records);
        result.put("todayScore",     roundedScore);
        result.put("typeStats",      typeStats);
        return result;
    }
}
