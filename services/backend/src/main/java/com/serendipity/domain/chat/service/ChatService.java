package com.serendipity.domain.chat.service;

import com.serendipity.domain.chat.dto.ChatMessageRequest;
import com.serendipity.domain.chat.dto.ChatMessageResponse;
import com.serendipity.domain.chat.entity.ChatMessage;
import com.serendipity.domain.chat.entity.ChatRoom;
import com.serendipity.domain.chat.repository.ChatMessageRepository;
import com.serendipity.domain.chat.repository.ChatRoomRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        return chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(room).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest req) {
        ChatRoom room = chatRoomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        User sender = null;
        if (req.getSenderId() != null) {
            sender = userRepository.findById(req.getSenderId()).orElse(null);
        }

        String role = req.getSenderRole() != null ? req.getSenderRole() : "USER";
        String type = req.getMessageType() != null ? req.getMessageType() : "TALK";

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .senderRole(role)
                .messageType(type)
                .content(req.getContent())
                .payload(req.getPayload())
                .build();

        chatMessageRepository.save(message);

        ChatMessageResponse response = toResponse(message);

        // STOMP WebSocket 구독자에게 실시간 브로드캐스팅
        messagingTemplate.convertAndSend("/sub/chat/room/" + room.getId(), response);

        return response;
    }

    @Transactional
    public int broadcastAdminNotice(String targetRegion, String title, String content) {
        List<ChatRoom> rooms = chatRoomRepository.findAll();
        int sentCount = 0;
        String formattedContent = (title != null && !title.isBlank())
                ? String.format("📢 [공지] %s\n%s", title, content)
                : String.format("📢 [공지] %s", content);

        for (ChatRoom room : rooms) {
            if (targetRegion != null && !targetRegion.isBlank() && !"ALL".equalsIgnoreCase(targetRegion)) {
                String roomRegion = room.getDiningTable() != null ? room.getDiningTable().getRegion() : "";
                if (roomRegion == null || !roomRegion.contains(targetRegion)) {
                    continue;
                }
            }

            ChatMessage message = ChatMessage.builder()
                    .chatRoom(room)
                    .sender(null)
                    .senderRole("ADMIN")
                    .messageType("ADMIN_NOTICE")
                    .content(formattedContent)
                    .build();
            chatMessageRepository.save(message);

            ChatMessageResponse response = toResponse(message);
            messagingTemplate.convertAndSend("/sub/chat/room/" + room.getId(), response);
            sentCount++;
        }
        return sentCount;
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        String nickname = "시스템";
        if ("ADMIN".equals(m.getSenderRole())) {
            nickname = "식탁 지킴이(운영자)";
        } else if (m.getSender() != null) {
            nickname = m.getSender().getNickname();
        }

        return ChatMessageResponse.builder()
                .id(m.getId())
                .roomId(m.getChatRoom().getId())
                .senderId(m.getSender() != null ? m.getSender().getId() : null)
                .senderNickname(nickname)
                .senderRole(m.getSenderRole())
                .messageType(m.getMessageType())
                .content(m.getContent())
                .payload(m.getPayload())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
