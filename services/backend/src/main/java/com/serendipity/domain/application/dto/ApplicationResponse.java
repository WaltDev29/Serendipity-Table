package com.serendipity.domain.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private UUID id;
    private Long eventSlotId;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private List<String> preferredRegions;
    private String status;
    private LocalDateTime createdAt;
}
