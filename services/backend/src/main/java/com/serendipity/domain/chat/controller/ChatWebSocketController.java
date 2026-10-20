package com.serendipity.domain.chat.controller;

import com.serendipity.domain.chat.dto.ChatMessageRequest;
import com.serendipity.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat/message")
    public void handleChatMessage(ChatMessageRequest message) {
        log.info("Received WebSocket chat message for room: {}, sender: {}", message.getRoomId(), message.getSenderId());
        chatService.sendMessage(message);
    }
}
