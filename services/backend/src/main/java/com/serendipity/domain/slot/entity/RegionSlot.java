package com.serendipity.domain.slot.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "region_slots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RegionSlot {

    @EmbeddedId
    private RegionSlotId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventSlotId")
    @JoinColumn(name = "event_slot_id", nullable = false)
    private EventSlot eventSlot;

    @Column(name = "target_capacity", nullable = false)
    @Builder.Default
    private Integer targetCapacity = 48;

    @Column(name = "current_count", nullable = false)
    @Builder.Default
    private Integer currentCount = 0;

    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    public void incrementCount() {
        this.currentCount++;
    }

    public void decrementCount() {
        if (this.currentCount > 0) {
            this.currentCount--;
        }
    }

    public void toggleClosed(boolean closed) {
        this.isClosed = closed;
    }
}
