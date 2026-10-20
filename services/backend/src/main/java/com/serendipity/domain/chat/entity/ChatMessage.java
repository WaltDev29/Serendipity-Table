package com.serendipity.domain.chat.entity;

import com.serendipity.domain.user.entity.User;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(name = "sender_role", length = 20, nullable = false)
    @Builder.Default
    private String senderRole = "USER"; // USER, ADMIN, SYSTEM

    @Column(name = "message_type", length = 30, nullable = false)
    @Builder.Default
    private String messageType = "TALK";

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Type(JsonBinaryType.class)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
