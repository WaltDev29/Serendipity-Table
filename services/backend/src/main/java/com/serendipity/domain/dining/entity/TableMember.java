package com.serendipity.domain.dining.entity;

import com.serendipity.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "table_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"table_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class TableMember {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private DiningTable diningTable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "role", length = 20, nullable = false)
    @Builder.Default
    private String role = "MEMBER"; // HOST, MEMBER

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "SCHEDULED"; // SCHEDULED, ATTENDED, NOSHOW, CANCELLED

    @CreatedDate
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void updateStatus(String status) {
        this.status = status;
    }
}
