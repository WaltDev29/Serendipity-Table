package com.serendipity.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFeedbackResponse {
    private Double atmosphereRating;
    private Double conversationRating;
    private Double venueRating;
    private Integer repurchaseRate;
    private List<FeedbackReviewItem> recentReviews;
    private List<String> favoriteUsers;
    private List<String> avoidedPairs;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackReviewItem {
        private String id;
        private String table;
        private String text;
        private Integer rating;
        private String createdAt;
    }
}
