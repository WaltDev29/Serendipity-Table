package com.serendipity.domain.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String orderNo;
    private String itemName;
    private String ticketType;
    private Integer amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
}
