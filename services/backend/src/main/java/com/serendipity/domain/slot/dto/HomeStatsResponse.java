package com.serendipity.domain.slot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeStatsResponse {
    private Long cumulativeParticipants;
    private Double averageRating;
    private Integer repurchaseRate;
}
