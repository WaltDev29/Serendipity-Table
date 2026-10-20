package com.serendipity.domain.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_audit_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "action_type", length = 50, nullable = false)
    private String actionType;

    @Column(name = "operator_name", length = 50, nullable = false)
    private String operatorName;

    @Column(name = "detail", columnDefinition = "TEXT", nullable = false)
    private String detail;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
