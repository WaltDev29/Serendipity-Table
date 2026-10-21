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

import java.time.LocalDateTime;
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
    private final com.serendipity.domain.dining.repository.TableMemberRepository tableMemberRepository;
    private final com.serendipity.domain.dining.repository.DiningTableRepository diningTableRepository;
    private final com.serendipity.domain.notification.service.NotificationService notificationService;

    @Transactional
    public ApplicationResponse apply(UUID userId, ApplicationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        EventSlot slot = eventSlotRepository.findById(req.getEventSlotId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "해당 슬롯을 찾을 수 없습니다."));

        if (!"OPEN".equals(slot.getStatus())) {
            throw new CustomException(ErrorCode.SLOT_CLOSED, "해당 회차는 마감되어 더 이상 신청할 수 없습니다.");
        }

        // 모임 3일 전(월요일) 매칭 진행 뒤에는 해당 회차 신청 불가
        if (slot.getMatchDeadline() != null && LocalDateTime.now().isAfter(slot.getMatchDeadline())) {
            throw new CustomException(ErrorCode.SLOT_CLOSED, "해당 회차는 매칭이 마감(월요일 18:00)되어 신청할 수 없습니다.");
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

        Application application = applicationRepository.findByUserAndEventSlot(user, slot)
                .map(existing -> {
                    existing.reapply(req.getPreferredRegions(), ticket);
                    return existing;
                })
                .orElseGet(() -> Application.builder()
                        .user(user)
                        .eventSlot(slot)
                        .preferredRegions(req.getPreferredRegions())
                        .status("APPLIED")
                        .ticket(ticket)
                        .build());

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

        // 화요일 정오 확정(CONFIRMED) 이후에는 취소 불가
        if ("CONFIRMED".equals(application.getStatus())) {
            throw new CustomException(ErrorCode.CANNOT_CANCEL_CONFIRMED, "화요일 정오 매칭 확정 이후에는 취소가 불가합니다.");
        }

        if ("CANCELLED".equals(application.getStatus())) {
            return;
        }

        // MATCHED 상태(1차 매칭 완료 후 확정 대기 중)에서 취소한 경우:
        // 해당 다이닝 테이블 취소 및 나머지 멤버들 재매칭 대상으로 복귀
        List<com.serendipity.domain.dining.entity.TableMember> memberships = tableMemberRepository.findByUser(user);
        for (com.serendipity.domain.dining.entity.TableMember tm : memberships) {
            com.serendipity.domain.dining.entity.DiningTable table = tm.getDiningTable();
            if (table.getEventSlot().getId().equals(application.getEventSlot().getId()) && !"CONFIRMED".equals(table.getStatus())) {
                List<com.serendipity.domain.dining.entity.TableMember> allTableMembers = tableMemberRepository.findByDiningTable(table);
                
                table.updateStatus("CANCELLED");
                
                LocalDateTime now = LocalDateTime.now();
                boolean isBeforeMon21 = (now.getDayOfWeek() == java.time.DayOfWeek.MONDAY && now.getHour() < 21);
                String rematchNotice = isBeforeMon21 ? "오늘(월) 21:00에 AI 재매칭이 진행됩니다." : "내일(화) 오전 8시에 AI 재매칭이 진행됩니다.";

                for (com.serendipity.domain.dining.entity.TableMember otherTm : allTableMembers) {
                    if (!otherTm.getUser().getId().equals(user.getId())) {
                        applicationRepository.findByUserAndEventSlot(otherTm.getUser(), table.getEventSlot())
                                .ifPresent(otherApp -> {
                                    otherApp.resetToApplied();
                                    applicationRepository.save(otherApp);
                                });
                        
                        notificationService.sendToUser(
                                otherTm.getUser(),
                                "REMATCH",
                                "테이블 인원 변동 안내",
                                "같은 테이블 멤버의 신청 취소로 인해 모임이 재조율됩니다. " + rematchNotice,
                                "/matching-waiting"
                        );
                    }
                    tableMemberRepository.delete(otherTm);
                }
            }
        }

        application.cancel();
        applicationRepository.save(application);

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

        // 취소 안내 알림 발송
        notificationService.sendToUser(
                user,
                "CANCEL",
                "참가 신청 취소 완료",
                "참가 신청이 취소되었으며, 참가권 1회가 보유 참가권으로 반환되었습니다.",
                "/"
        );
    }
}
