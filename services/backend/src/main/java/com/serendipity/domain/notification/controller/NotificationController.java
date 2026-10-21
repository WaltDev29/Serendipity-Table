package com.serendipity.domain.notification.controller;

import com.serendipity.domain.notification.dto.NotificationResponse;
import com.serendipity.domain.notification.service.NotificationService;
import com.serendipity.global.common.ApiResponse;
import com.serendipity.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationResponse> list = notificationService.getMyNotifications(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        notificationService.markAsRead(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("알림 읽음 처리 완료", null));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("모든 알림 읽음 처리 완료", null));
    }
}
