package com.serendipity.domain.user.repository;

import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserTicketRepository extends JpaRepository<UserTicket, UUID> {
    List<UserTicket> findByUserOrderByCreatedAtDesc(User user);
    Optional<UserTicket> findFirstByUserAndRemainingCountGreaterThanOrderByCreatedAtAsc(User user, int count);
}
