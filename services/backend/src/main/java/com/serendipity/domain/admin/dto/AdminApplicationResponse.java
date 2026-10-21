package com.serendipity.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminApplicationResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private String gender;
    private Integer age;
    private String phone;
    private String instagramId;
    private String job;
    private String mbti;
    private List<String> regions;
    private String region;
    private String ticketType;
    private String paymentStatus;
    private String matchStatus;
    private String status;
    private String assignedTable;
    private List<String> interests;
    private List<String> myTendencies;
    private List<String> preferredTendencies;
    private List<String> budgetRanges;
    private String foodRestrictions;
    private LocalDateTime createdAt;
}
