package com.serendipity.domain.application.service;

import com.serendipity.domain.application.dto.OrderCheckoutRequest;
import com.serendipity.domain.application.dto.OrderResponse;
import com.serendipity.domain.application.entity.Order;
import com.serendipity.domain.application.repository.OrderRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserTicket;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.domain.user.repository.UserTicketRepository;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UserTicketRepository userTicketRepository;

    @Transactional
    public OrderResponse checkout(UUID userId, OrderCheckoutRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String orderNo = "ORD-" + datePrefix + "-" + randomSuffix;

        Order order = Order.builder()
                .orderNo(orderNo)
                .user(user)
                .itemName(req.getItemName())
                .ticketType(req.getTicketType())
                .amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod())
                .status("PAID")
                .pgTid("PG-" + UUID.randomUUID())
                .build();

        orderRepository.save(order);

        // 참가권 발급 (1_TICKET: 1회, 3_TICKETS: 3회)
        int ticketCount = "3_TICKETS".equalsIgnoreCase(req.getTicketType()) ? 3 : 1;
        UserTicket newTicket = UserTicket.builder()
                .user(user)
                .ticketType(req.getTicketType())
                .totalCount(ticketCount)
                .remainingCount(ticketCount)
                .build();

        userTicketRepository.save(newTicket);

        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .itemName(order.getItemName())
                .ticketType(order.getTicketType())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(o -> OrderResponse.builder()
                        .id(o.getId())
                        .orderNo(o.getOrderNo())
                        .itemName(o.getItemName())
                        .ticketType(o.getTicketType())
                        .amount(o.getAmount())
                        .paymentMethod(o.getPaymentMethod())
                        .status(o.getStatus())
                        .createdAt(o.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
