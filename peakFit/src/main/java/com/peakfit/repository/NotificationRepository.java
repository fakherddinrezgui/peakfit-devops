package com.peakfit.repository;

import com.peakfit.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);

    Optional<Notification> findByIdAndUserId(Integer id, Integer userId);

    @Modifying
    @Query("UPDATE Notification n SET n.lu = true WHERE n.userId = :uid")
    void markAllReadByUserId(@Param("uid") Integer userId);
}
