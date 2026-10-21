package com.serendipity.domain.application.repository;

import com.serendipity.domain.application.entity.Order;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNo(String orderNo);
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
