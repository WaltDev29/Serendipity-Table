package com.serendipity.domain.slot.service;

import com.serendipity.domain.dining.repository.DiningFeedbackRepository;
import com.serendipity.domain.dining.repository.TableMemberRepository;
import com.serendipity.domain.slot.dto.HomeStatsResponse;
import com.serendipity.domain.slot.dto.SlotResponse;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.slot.entity.RegionSlot;
import com.serendipity.domain.slot.repository.EventSlotRepository;
import com.serendipity.domain.slot.repository.RegionSlotRepository;
import com.serendipity.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final EventSlotRepository eventSlotRepository;
    private final RegionSlotRepository regionSlotRepository;
    private final TableMemberRepository tableMemberRepository;
    private final UserRepository userRepository;
    private final DiningFeedbackRepository diningFeedbackRepository;

    @Transactional(readOnly = true)
    public HomeStatsResponse getHomeStats() {
        // 누적 참가자는 본 앱 개발 이전 1700명이 참가했으므로, DB 개수에 1700을 더함
        long dbParticipants = tableMemberRepository.count();
        if (dbParticipants == 0) {
            dbParticipants = userRepository.count();
        }
        long cumulativeParticipants = dbParticipants + 1700L;

        // 피드백 평점 (기본값 4.8)
        double avgRating = 4.8;
        var feedbacks = diningFeedbackRepository.findAll();
        if (!feedbacks.isEmpty()) {
            avgRating = feedbacks.stream()
                    .mapToInt(f -> f.getRating() != null ? f.getRating() : 5)
                    .average()
                    .orElse(4.8);
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        }

        // 재참여 희망률 (94%)
        int repurchaseRate = 94;

        return HomeStatsResponse.builder()
                .cumulativeParticipants(cumulativeParticipants)
                .averageRating(avgRating)
                .repurchaseRate(repurchaseRate)
                .build();
    }

    private static final List<String> DEFAULT_REGIONS = List.of("홍대/합정", "잠실/송파", "강남/신논현", "을지로/종로");

    /**
     * 현재 시점 기준 향후 N주(기본 4주)의 매주 목요일 회차와 4대 권역 슬롯이 존재하는지 확인하고 자동 생성
     */
    @Transactional
    public void ensureUpcomingThursdaySlots(int weeksAhead) {
        LocalDate today = LocalDate.now();
        LocalDate nextThursday = today.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.THURSDAY));
        if (nextThursday.isEqual(today)) {
            // 오늘이 목요일인 경우에도 당일 및 이후 목요일 보장
        }

        for (int i = 0; i < weeksAhead; i++) {
            LocalDate thurDate = nextThursday.plusWeeks(i);
            if (eventSlotRepository.findByEventDate(thurDate).isEmpty()) {
                createEventSlotWithDefaultRegions(thurDate, 48);
            }
        }
    }

    /**
     * 특정 날짜 회차 및 권역 슬롯 생성
     */
    @Transactional
    public EventSlot createEventSlotWithDefaultRegions(LocalDate eventDate, int targetCapacityPerRegion) {
        // 매칭 마감일: 모임 주 월요일 18:00 (모임일 직전 월요일)
        LocalDate monday = eventDate.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        java.time.LocalDateTime matchDeadline = monday.atTime(18, 0, 0);

        EventSlot slot = EventSlot.builder()
                .eventDate(eventDate)
                .eventTime(java.time.LocalTime.of(19, 30))
                .matchDeadline(matchDeadline)
                .status("OPEN")
                .build();

        EventSlot savedSlot = eventSlotRepository.save(slot);

        for (String reg : DEFAULT_REGIONS) {
            RegionSlot regionSlot = RegionSlot.builder()
                    .id(new com.serendipity.domain.slot.entity.RegionSlotId(savedSlot.getId(), reg))
                    .eventSlot(savedSlot)
                    .targetCapacity(targetCapacityPerRegion)
                    .currentCount(0)
                    .isClosed(false)
                    .build();
            regionSlotRepository.save(regionSlot);
        }

        return savedSlot;
    }

    @Transactional
    public List<SlotResponse> getUpcomingSlots() {
        ensureUpcomingThursdaySlots(4);
        return eventSlotRepository.findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** 관리자용: 지난 회차를 포함한 전체 회차 (모임 일자 오름차순) */
    @Transactional
    public List<SlotResponse> getAllSlots() {
        ensureUpcomingThursdaySlots(4);
        return eventSlotRepository.findAll(org.springframework.data.domain.Sort.by("eventDate"))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private SlotResponse toResponse(EventSlot slot) {
        var regionResponses = regionSlotRepository.findByIdEventSlotId(slot.getId()).stream()
                .map(rs -> SlotResponse.RegionSlotResponse.builder()
                        .region(rs.getId().getRegion())
                        .targetCapacity(rs.getTargetCapacity())
                        .currentCount(rs.getCurrentCount())
                        .isClosed(rs.getIsClosed())
                        .build())
                .collect(Collectors.toList());

        return SlotResponse.builder()
                .id(slot.getId())
                .eventDate(slot.getEventDate())
                .eventTime(slot.getEventTime())
                .matchDeadline(slot.getMatchDeadline())
                .status(slot.getStatus())
                .regions(regionResponses)
                .build();
    }
}
