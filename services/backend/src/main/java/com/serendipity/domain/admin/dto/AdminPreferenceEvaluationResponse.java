package com.serendipity.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPreferenceEvaluationResponse {
    private UUID id;
    private String userName;
    private String userGender; // '여' or '남'
    private Integer userAge;
    private String userPhone;
    private String type; // 'PREFER' (선호) or 'AVOID' (비선호)
    private String typeLabel; // "선호 (다시 만나고 싶음)" or "비선호 (매칭 제외)"
    private String targetUserName;
    private String eventDate; // 모임 날짜
    private String createdAt;
}
