package com.serendipity.domain.user.entity;

import com.serendipity.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserTicket extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "ticket_type", length = 30, nullable = false)
    private String ticketType;

    @Column(name = "total_count", nullable = false)
    private Integer totalCount;

    @Column(name = "remaining_count", nullable = false)
    private Integer remainingCount;

    public void deduct() {
        if (this.remainingCount <= 0) {
            throw new IllegalStateException("남은 참가권이 없습니다.");
        }
        this.remainingCount--;
    }

    public void restore() {
        this.remainingCount++;
    }
}
