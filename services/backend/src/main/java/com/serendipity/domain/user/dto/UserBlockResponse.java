package com.serendipity.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBlockResponse {
    private UUID id;
    private UUID blockedUserId;
    private String blockedUserNickname;
    private String reason;
    private LocalDateTime createdAt;
}
