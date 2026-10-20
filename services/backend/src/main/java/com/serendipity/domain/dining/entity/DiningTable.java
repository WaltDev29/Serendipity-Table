package com.serendipity.domain.dining.entity;

import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.venue.entity.Venue;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dining_tables")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_slot_id", nullable = false)
    private EventSlot eventSlot;

    @Column(name = "table_no", nullable = false)
    private Integer tableNo;

    @Column(name = "region", length = 30, nullable = false)
    private String region;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(name = "harmony_score", precision = 4, scale = 1)
    private BigDecimal harmonyScore;

    @Column(name = "male_count", nullable = false)
    @Builder.Default
    private Integer maleCount = 2;

    @Column(name = "female_count", nullable = false)
    @Builder.Default
    private Integer femaleCount = 2;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "CONFIRMED"; // ASSIGNED, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "reservation_status", length = 20, nullable = false)
    @Builder.Default
    private String reservationStatus = "PENDING"; // PENDING, RESERVED, CANCELLED

    @OneToMany(mappedBy = "diningTable", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TableMember> members = new ArrayList<>();

    @CreatedDate
    @Column(name = "confirmed_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void updateStatus(String status) {
        this.status = status;
    }

    public void updateReservationStatus(String reservationStatus) {
        this.reservationStatus = reservationStatus;
    }

    public void assignVenue(Venue venue) {
        this.venue = venue;
    }
}
