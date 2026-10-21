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
public class AdminReviewResponse {
    private UUID id;
    private String userName;
    private String userGender; // '여' or '남'
    private Integer userAge;
    private String userPhone;
    private String eventDate; // 모임 날짜
    private Integer rating;
    private String comment;
    private String tableName;
    private String createdAt;
}
