package com.serendipity.domain.slot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event_slots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EventSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_time", nullable = false)
    private LocalTime eventTime;

    @Column(name = "match_deadline", nullable = false)
    private LocalDateTime matchDeadline;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "OPEN"; // OPEN, MATCHING, CONFIRMED, CLOSED

    @OneToMany(mappedBy = "eventSlot", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RegionSlot> regionSlots = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void updateStatus(String status) {
        this.status = status;
    }
}
