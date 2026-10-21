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

    @org.springframework.web.bind.annotation.PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable UUID roomId,
            @org.springframework.web.bind.annotation.RequestBody com.serendipity.domain.chat.dto.ChatMessageRequest req) {
        req.setRoomId(roomId);
        ChatMessageResponse response = chatService.sendMessage(req);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @org.springframework.web.bind.annotation.PostMapping("/broadcast-notice")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> broadcastNotice(
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {
        String region = body.getOrDefault("region", "ALL");
        String title = body.getOrDefault("title", "");
        String content = body.getOrDefault("content", "");
        int count = chatService.broadcastAdminNotice(region, title, content);
        return ResponseEntity.ok(ApiResponse.ok(java.util.Map.of("sentRooms", count)));
    }
}
