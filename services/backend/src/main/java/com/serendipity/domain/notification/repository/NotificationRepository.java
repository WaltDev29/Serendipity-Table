package com.serendipity.domain.notification.repository;

import com.serendipity.domain.notification.entity.Notification;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserOrUserIsNullOrderByCreatedAtDesc(User user);
}
