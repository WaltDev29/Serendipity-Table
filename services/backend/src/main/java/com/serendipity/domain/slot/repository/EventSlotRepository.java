package com.serendipity.domain.slot.repository;

import com.serendipity.domain.slot.entity.EventSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventSlotRepository extends JpaRepository<EventSlot, Long> {
    List<EventSlot> findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);
    Optional<EventSlot> findByEventDate(LocalDate date);
    Optional<EventSlot> findFirstByStatusOrderByEventDateAsc(String status);
}
