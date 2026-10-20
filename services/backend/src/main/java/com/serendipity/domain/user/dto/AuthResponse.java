package com.serendipity.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private UUID userId;
    private String phone;
    private String name;
    private String nickname;
    private String role;
    private BigDecimal mannerTemp;
    private int ticketCount;
}
