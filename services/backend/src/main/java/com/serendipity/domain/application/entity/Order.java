package com.serendipity.domain.application.entity;

import com.serendipity.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "order_no", length = 64, nullable = false, unique = true)
    private String orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_name", length = 100, nullable = false)
    private String itemName;

    @Column(name = "ticket_type", length = 30, nullable = false)
    private String ticketType;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "payment_method", length = 30, nullable = false)
    private String paymentMethod;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "PAID"; // PAID, CANCELLED, FAILED

    @Column(name = "pg_tid", length = 100)
    private String pgTid;

    @CreatedDate
    @Column(name = "paid_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void updateStatus(String status) {
        this.status = status;
    }
}
