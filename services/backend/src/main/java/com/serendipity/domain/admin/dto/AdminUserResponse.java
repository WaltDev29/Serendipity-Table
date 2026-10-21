package com.serendipity.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private UUID id;
    private String name;
    private String nickname;
    private String phone;
    private Integer birthYear;
    private Integer age;
    private String gender;
    private String job;
    private String instagramId;
    private String mbti;
    private BigDecimal mannerTemp;
    private Integer strikeCount;
    private Integer attendanceCount;
    private Integer remainingTickets;
    private Integer totalSpend;
    private String role;
    private String status;
    private String banReason;
    private LocalDateTime bannedAt;
    private LocalDateTime createdAt;
}
