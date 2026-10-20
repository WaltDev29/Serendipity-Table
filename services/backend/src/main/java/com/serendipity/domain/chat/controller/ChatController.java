package com.serendipity.domain.chat.controller;

import com.serendipity.domain.chat.dto.ChatMessageResponse;
import com.serendipity.domain.chat.service.ChatService;
import com.serendipity.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(@PathVariable UUID roomId) {
        List<ChatMessageResponse> messages = chatService.getMessages(roomId);
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }
}
