package com.serendipity.domain.slot.repository;

import com.serendipity.domain.slot.entity.RegionSlot;
import com.serendipity.domain.slot.entity.RegionSlotId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegionSlotRepository extends JpaRepository<RegionSlot, RegionSlotId> {
    List<RegionSlot> findByIdEventSlotId(Long eventSlotId);
}
