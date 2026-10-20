package com.serendipity.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;
    private UUID roomId;
    private UUID senderId;
    private String senderNickname;
    private String senderRole;
    private String messageType;
    private String content;
    private Map<String, Object> payload;
    private LocalDateTime createdAt;
}
