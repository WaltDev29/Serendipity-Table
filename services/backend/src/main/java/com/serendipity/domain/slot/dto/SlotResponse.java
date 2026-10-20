package com.serendipity.domain.slot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponse {
    private Long id;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private LocalDateTime matchDeadline;
    private String status;
    private List<RegionSlotResponse> regions;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionSlotResponse {
        private String region;
        private Integer targetCapacity;
        private Integer currentCount;
        private Boolean isClosed;
    }
}
