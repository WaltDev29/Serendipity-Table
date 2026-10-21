package com.serendipity.domain.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessageRequest {

    @NotNull(message = "채팅방 ID는 필수입니다.")
    private UUID roomId;

    private UUID senderId;

    private String senderRole; // USER, ADMIN, SYSTEM

    private String messageType; // TALK, SYSTEM_WELCOME, ADMIN_NOTICE, MATCH_CONFIRM, MENU_SHARE, AFTER_PARTY_VOTE, REVIEW_REQ

    @NotBlank(message = "메시지 내용은 필수입니다.")
    private String content;

    private Map<String, Object> payload;
}
