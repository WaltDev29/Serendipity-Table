package com.serendipity.domain.chat.repository;

import com.serendipity.domain.chat.entity.ChatMessage;
import com.serendipity.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
    List<ChatMessage> findTop50ByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
    void deleteByChatRoom(ChatRoom chatRoom);
}
