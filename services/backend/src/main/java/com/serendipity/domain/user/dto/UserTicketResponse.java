package com.serendipity.domain.user.dto;

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
public class UserTicketResponse {
    private UUID id;
    private String ticketType;
    private Integer totalCount;
    private Integer remainingCount;
    private LocalDateTime createdAt;
}
