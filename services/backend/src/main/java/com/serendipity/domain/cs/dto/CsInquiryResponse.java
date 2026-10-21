package com.serendipity.domain.cs.dto;

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
public class CsInquiryResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private String userPhone;
    private String category;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private List<ReplyInfo> replies;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplyInfo {
        private Long id;
        private String operatorName;
        private String replyContent;
        private LocalDateTime createdAt;
    }
}
