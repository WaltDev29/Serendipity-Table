package com.serendipity.domain.application.service;

import com.serendipity.domain.application.dto.ApplicationRequest;
import com.serendipity.domain.application.dto.ApplicationResponse;
import com.serendipity.domain.application.entity.Application;
import com.serendipity.domain.application.repository.ApplicationRepository;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.slot.entity.RegionSlot;
import com.serendipity.domain.slot.entity.RegionSlotId;
import com.serendipity.domain.slot.repository.EventSlotRepository;
import com.serendipity.domain.slot.repository.RegionSlotRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserTicket;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.domain.user.repository.UserTicketRepository;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final EventSlotRepository eventSlotRepository;
    private final RegionSlotRepository regionSlotRepository;
    private final UserRepository userRepository;
    private final UserTicketRepository userTicketRepository;

    @Transactional
    public ApplicationResponse apply(UUID userId, ApplicationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        EventSlot slot = eventSlotRepository.findById(req.getEventSlotId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "해당 슬롯을 찾을 수 없습니다."));

        if (!"OPEN".equals(slot.getStatus())) {
            throw new CustomException(ErrorCode.SLOT_CLOSED);
        }

        if (applicationRepository.existsByUserAndEventSlotAndStatusNot(user, slot, "CANCELLED")) {
            throw new CustomException(ErrorCode.ALREADY_APPLIED);
        }

        // 사용 가능한 참가권 차감
        UserTicket ticket = userTicketRepository
                .findFirstByUserAndRemainingCountGreaterThanOrderByCreatedAtAsc(user, 0)
                .orElseThrow(() -> new CustomException(ErrorCode.TICKET_INSUFFICIENT));

        ticket.deduct();

        // 1순위 권역 인원수 증가
        if (!req.getPreferredRegions().isEmpty()) {
            String firstRegion = req.getPreferredRegions().get(0);
            RegionSlotId regionId = new RegionSlotId(slot.getId(), firstRegion);
            regionSlotRepository.findById(regionId).ifPresent(RegionSlot::incrementCount);
        }

        Application application = Application.builder()
                .user(user)
                .eventSlot(slot)
                .preferredRegions(req.getPreferredRegions())
                .status("APPLIED")
                .ticket(ticket)
                .build();

        applicationRepository.save(application);

        return ApplicationResponse.builder()
                .id(application.getId())
                .eventSlotId(slot.getId())
                .eventDate(slot.getEventDate())
                .eventTime(slot.getEventTime())
                .preferredRegions(application.getPreferredRegions())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return applicationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(app -> ApplicationResponse.builder()
                        .id(app.getId())
                        .eventSlotId(app.getEventSlot().getId())
                        .eventDate(app.getEventSlot().getEventDate())
                        .eventTime(app.getEventSlot().getEventTime())
                        .preferredRegions(app.getPreferredRegions())
                        .status(app.getStatus())
                        .createdAt(app.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelApplication(UUID userId, UUID applicationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        if ("MATCHED".equals(application.getStatus())) {
            throw new CustomException(ErrorCode.CANNOT_CANCEL_CONFIRMED);
        }

        if ("CANCELLED".equals(application.getStatus())) {
            return;
        }

        application.cancel();

        // 참가권 복구
        if (application.getTicket() != null) {
            application.getTicket().restore();
        }

        // 권역 카운트 감소
        if (!application.getPreferredRegions().isEmpty()) {
            String firstRegion = application.getPreferredRegions().get(0);
            RegionSlotId regionId = new RegionSlotId(application.getEventSlot().getId(), firstRegion);
            regionSlotRepository.findById(regionId).ifPresent(RegionSlot::decrementCount);
        }
    }
}
