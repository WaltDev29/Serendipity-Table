package com.serendipity.domain.slot.service;

import com.serendipity.domain.slot.dto.SlotResponse;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.slot.repository.EventSlotRepository;
import com.serendipity.domain.slot.repository.RegionSlotRepository;
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
