package com.serendipity.domain.dining.repository;

import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.slot.entity.EventSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiningTableRepository extends JpaRepository<DiningTable, UUID> {
    List<DiningTable> findByEventSlot(EventSlot eventSlot);
    List<DiningTable> findByEventSlotId(Long eventSlotId);
}
