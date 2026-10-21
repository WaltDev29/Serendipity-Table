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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
     * 목요일 회차 자동 생성:
     * - 현재 시점 기준 다가오는 목요일 및 차주 목요일 회차가 존재하도록 보장
     * - 매주 월요일마다 그 다음주 목요일(D+10) 회차를 선제적으로 생성
     */
    @Transactional
    public void ensureUpcomingThursdaySlots(int weeksAhead) {
        LocalDate today = LocalDate.now();
        LocalDate nextThursday = today.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.THURSDAY));

        for (int i = 0; i < weeksAhead; i++) {
            LocalDate thurDate = nextThursday.plusWeeks(i);
            if (eventSlotRepository.findByEventDate(thurDate).isEmpty()) {
                createEventSlotWithDefaultRegions(thurDate, 0);
            }
        }
    }

    /**
     * 매주 월요일마다 실행: 그 다음주 목요일(차차주 목요일, 약 10일 후) 회차를 자동 생성
     */
    @Transactional
    public void createNextWeekThursdaySlotOnMonday() {
        LocalDate today = LocalDate.now();
        // 오늘(월요일) 기준 그 다음주 목요일 = 이번주 목요일(D+3)의 다음주 목요일(D+10)
        LocalDate thisThursday = today.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.THURSDAY));
        LocalDate nextWeekThursday = thisThursday.plusWeeks(1);

        if (eventSlotRepository.findByEventDate(nextWeekThursday).isEmpty()) {
            createEventSlotWithDefaultRegions(nextWeekThursday, 0);
            log.info("[회차자동생성] 차주 목요일 회차 자동 생성 완료: {}", nextWeekThursday);
        }
    }

    /**
     * 특정 날짜 회차 및 권역 슬롯 생성 (정원 제한 없으므로 targetCapacity=0)
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
