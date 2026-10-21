package com.serendipity.domain.application.repository;

import com.serendipity.domain.application.entity.Application;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    Optional<Application> findByUserAndEventSlot(User user, EventSlot eventSlot);
    boolean existsByUserAndEventSlotAndStatusNot(User user, EventSlot eventSlot, String status);
    List<Application> findByUserOrderByCreatedAtDesc(User user);
    List<Application> findByEventSlot(EventSlot eventSlot);
    List<Application> findByEventSlotId(Long eventSlotId);
}
