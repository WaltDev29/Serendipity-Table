package com.serendipity.domain.admin.dto;

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
public class AdminOrderResponse {

    private UUID id;
    private String orderNo;
    private UUID userId;
    private String userName;
    private String userPhone;
    private String itemName;
    private String ticketType;
    private Integer amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
