package com.serendipity.domain.slot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegionSlotId implements Serializable {

    @Column(name = "event_slot_id")
    private Long eventSlotId;

    @Column(name = "region", length = 30)
    private String region;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RegionSlotId that = (RegionSlotId) o;
        return Objects.equals(eventSlotId, that.eventSlotId) && Objects.equals(region, that.region);
    }

    @Override
    public int hashCode() {
        return Objects.hash(eventSlotId, region);
    }
}
