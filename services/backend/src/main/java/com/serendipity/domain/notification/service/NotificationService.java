package com.serendipity.domain.notification.service;

import com.serendipity.domain.notification.dto.NotificationResponse;
import com.serendipity.domain.notification.entity.Notification;
import com.serendipity.domain.notification.repository.NotificationRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Notification sendToUser(User user, String type, String title, String content, String link) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .content(content)
                .link(link)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification broadcast(String type, String title, String content, String link) {
        Notification notification = Notification.builder()
                .user(null) // 전체 사용자용
                .type(type)
                .title(title)
                .content(content)
                .link(link)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<Notification> list = notificationRepository.findByUserOrUserIsNullOrderByCreatedAtDesc(user);
        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "알림을 찾을 수 없습니다."));

        if (notification.getUser() != null && !notification.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        notification.markAsRead();
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<Notification> list = notificationRepository.findByUserOrUserIsNullOrderByCreatedAtDesc(user);
        for (Notification n : list) {
            n.markAsRead();
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .desc(n.getContent())
                .link(n.getLink())
                .read(Boolean.TRUE.equals(n.getIsRead()))
                .time(formatRelativeTime(n.getCreatedAt()))
                .createdAt(n.getCreatedAt())
                .build();
    }

    private String formatRelativeTime(LocalDateTime time) {
        if (time == null) return "방금 전";
        Duration diff = Duration.between(time, LocalDateTime.now());
        long seconds = diff.getSeconds();
        if (seconds < 60) return "방금 전";
        if (seconds < 3600) return (seconds / 60) + "분 전";
        if (seconds < 86400) return (seconds / 3600) + "시간 전";
        return (seconds / 86400) + "일 전";
    }
}
