package com.serendipity.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private String phone;
    private String name;
    private String nickname;
    private Integer birthYear;
    private String gender;
    private String job;
    private String instagramId;
    private String mbti;
    private List<String> interests;
    private List<String> myTendencies;
    private List<String> preferredTendencies;
    private List<String> budgetRanges;
    private String foodRestrictions;
    private BigDecimal mannerTemp;
    private Integer strikeCount;
    private String role;
    private String status;
    private String profileImageUrl;
    private int ticketCount;
}
