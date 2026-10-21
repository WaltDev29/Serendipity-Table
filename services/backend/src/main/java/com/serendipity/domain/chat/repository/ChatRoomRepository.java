package com.serendipity.domain.chat.repository;

import com.serendipity.domain.chat.entity.ChatRoom;
import com.serendipity.domain.dining.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {
    Optional<ChatRoom> findByDiningTable(DiningTable diningTable);
    Optional<ChatRoom> findByDiningTableId(UUID diningTableId);
}
