package com.serendipity.domain.slot.service;

import com.serendipity.domain.dining.repository.DiningFeedbackRepository;
import com.serendipity.domain.dining.repository.TableMemberRepository;
import com.serendipity.domain.slot.dto.HomeStatsResponse;
import com.serendipity.domain.slot.dto.SlotResponse;
import com.serendipity.domain.slot.entity.EventSlot;
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

    @Transactional(readOnly = true)
    public List<SlotResponse> getUpcomingSlots() {
        List<EventSlot> slots = eventSlotRepository.findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now());

        return slots.stream().map(slot -> {
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
        }).collect(Collectors.toList());
    }
}
