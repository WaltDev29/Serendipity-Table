package com.serendipity.domain.dining.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveTableResponse {

    private UUID tableId;
    private Long eventSlotId;
    private Integer tableNo;
    private String region;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private BigDecimal harmonyScore;
    private String status;
    private String reservationStatus;
    private UUID chatRoomId;

    // Venue details
    private VenueInfo venue;

    // Members (4 members)
    private List<MemberInfo> members;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VenueInfo {
        private UUID id;
        private String name;
        private String address;
        private String mapUrl;
        private String naverMapUrl;
        private String representativeMenu;
        private Integer avgPrice;
        private String phone;
        private String imageUrl;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private UUID userId;
        private String nickname;
        private Integer birthYear;
        private String gender;
        private String job;
        private String mbti;
        private String role; // HOST, MEMBER
        private BigDecimal mannerTemp;
    }
}
