package com.serendipity.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class NotificationResponse {
    private UUID id;
    private String type;
    private String title;
    private String desc;
    private String link;
    private boolean read;
    private String time;
    private LocalDateTime createdAt;
}
