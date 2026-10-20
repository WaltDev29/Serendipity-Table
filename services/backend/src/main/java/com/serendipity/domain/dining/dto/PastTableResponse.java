package com.serendipity.domain.dining.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PastTableResponse {
    private UUID tableId;
    private LocalDate eventDate;
    private String region;
    private String venueName;
    private String venueImageUrl;
    private List<String> memberNicknames;
    private boolean feedbackSubmitted;
}
