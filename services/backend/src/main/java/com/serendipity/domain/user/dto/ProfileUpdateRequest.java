package com.serendipity.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ProfileUpdateRequest {
    private String nickname;
    private String job;
    private String instagramId;
    private String mbti;
    private List<String> interests;
    private List<String> myTendencies;
    private List<String> preferredTendencies;
    private List<String> budgetRanges;
    private String foodRestrictions;
}
