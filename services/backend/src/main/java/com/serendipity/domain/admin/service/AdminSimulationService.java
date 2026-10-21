package com.serendipity.domain.admin.service;

import com.serendipity.domain.admin.entity.AdminAuditLog;
import com.serendipity.domain.admin.repository.AdminAuditLogRepository;
import com.serendipity.domain.application.entity.Application;
import com.serendipity.domain.application.repository.ApplicationRepository;
import com.serendipity.domain.application.service.ApplicationService;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.slot.entity.RegionSlot;
import com.serendipity.domain.slot.entity.RegionSlotId;
import com.serendipity.domain.slot.repository.EventSlotRepository;
import com.serendipity.domain.slot.repository.RegionSlotRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserTicket;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.domain.user.repository.UserTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serendipity.domain.application.entity.Order;
import com.serendipity.domain.application.repository.OrderRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSimulationService {

    private final UserRepository userRepository;
    private final UserTicketRepository userTicketRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;
    private final EventSlotRepository eventSlotRepository;
    private final RegionSlotRepository regionSlotRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;
    private final OrderRepository orderRepository;

    // 시뮬레이션 결제 1회권 기본 금액 (실제 PG 결제는 발생하지 않음)
    private static final int SIMULATION_TICKET_PRICE = 8000;
    private static final String DEFAULT_REGION = "홍대/합정";

    /**
     * 대상 사용자 목록 확인 (비어있으면 전체 일반 회원)
     */
    private List<User> resolveUsers(List<UUID> userIds) {
        if (userIds != null && !userIds.isEmpty()) {
            return userRepository.findAllById(userIds);
        }
        return userRepository.findAll().stream()
                .filter(u -> !"ROLE_ADMIN".equals(u.getRole()))
                .collect(Collectors.toList());
    }

    /**
     * 1. 참가권 1개씩 부여
     */
    @Transactional
    public Map<String, Object> grantTickets(List<UUID> userIds, String operatorName) {
        List<User> users = resolveUsers(userIds);
        int affectedCount = 0;

        for (User user : users) {
            // 사용자가 1회권을 결제한 것과 동일하게 주문 내역 + 참가권을 함께 생성
            createPaidTicket(user);
            affectedCount++;
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SIMULATION_GRANT_TICKET")
                .operatorName(operatorName)
                .detail(String.format("시뮬레이션: %d명에게 참가권 1회씩 부여 완료", affectedCount))
                .build());

        return Map.of("action", "GRANT_TICKET", "affectedUsers", affectedCount);
    }

    /**
     * 2. 참가권 1개 회수
     */
    @Transactional
    public Map<String, Object> revokeTickets(List<UUID> userIds, String operatorName) {
        List<User> users = resolveUsers(userIds);
        int affectedCount = 0;

        for (User user : users) {
            var ticketOpt = userTicketRepository.findFirstByUserAndRemainingCountGreaterThanOrderByCreatedAtAsc(user, 0);
            if (ticketOpt.isEmpty()) {
                continue;
            }
            UserTicket t = ticketOpt.get();
            t.deduct(); // remainingCount - 1
            userTicketRepository.save(t);

            // 회수한 참가권에 대응하는 최근 1회권 결제 내역을 삭제
            orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                    .filter(o -> "1_TICKET".equalsIgnoreCase(o.getTicketType()) && "PAID".equals(o.getStatus()))
                    .findFirst()
                    .ifPresent(orderRepository::delete);
            affectedCount++;
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SIMULATION_REVOKE_TICKET")
                .operatorName(operatorName)
                .detail(String.format("시뮬레이션: %d명에게서 참가권 1회 회수 완료", affectedCount))
                .build());

        return Map.of("action", "REVOKE_TICKET", "affectedUsers", affectedCount);
    }

    private void createPaidTicket(User user) {
        String orderNo = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        orderRepository.save(Order.builder()
                .orderNo(orderNo)
                .user(user)
                .itemName("참가권 1회 (시뮬레이션)")
                .ticketType("1_TICKET")
                .amount(SIMULATION_TICKET_PRICE)
                .paymentMethod("SIMULATION")
                .status("PAID")
                .pgTid("PG-SIM-" + UUID.randomUUID())
                .build());
        userTicketRepository.save(UserTicket.builder()
                .user(user)
                .ticketType("1_TICKET")
                .totalCount(1)
                .remainingCount(1)
                .build());
    }

    /**
     * 사용자의 권역 결정: 최근 신청 권역 우선, 없으면 해당 회차에서 마감되지 않은 첫 권역
     */
    private String resolveRegion(User user, EventSlot slot) {
        return applicationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(Application::getPreferredRegions)
                .filter(r -> r != null && !r.isEmpty())
                .map(r -> r.get(0))
                .findFirst()
                .orElseGet(() -> regionSlotRepository.findByIdEventSlotId(slot.getId()).stream()
                        .filter(rs -> !Boolean.TRUE.equals(rs.getIsClosed()))
                        .map(rs -> rs.getId().getRegion())
                        .findFirst()
                        .orElse(DEFAULT_REGION));
    }

    /**
     * 3. 가장 가까운 슬롯으로 참가 신청
     */
    @Transactional
    public Map<String, Object> applyNearestSlot(List<UUID> userIds, String operatorName) {
        List<User> users = resolveUsers(userIds);
        EventSlot nearestSlot = eventSlotRepository.findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now())
                .stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("신청 가능한 회차 슬롯이 존재하지 않습니다."));

        int appliedCount = 0;

        for (User user : users) {
            // 이미 해당 슬롯에 신청 중인지 확인
            boolean alreadyApplied = applicationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                    .anyMatch(a -> a.getEventSlot().getId().equals(nearestSlot.getId()) && !"CANCELLED".equals(a.getStatus()));

            if (alreadyApplied) {
                continue;
            }

            // 티켓 확인 (없으면 시뮬레이션용 1회권 자동 부여)
            UserTicket ticket = userTicketRepository.findFirstByUserAndRemainingCountGreaterThanOrderByCreatedAtAsc(user, 0)
                    .orElseGet(() -> {
                        UserTicket t = UserTicket.builder()
                                .user(user)
                                .ticketType("1_TICKET")
                                .totalCount(1)
                                .remainingCount(1)
                                .build();
                        return userTicketRepository.save(t);
                    });

            ticket.deduct();
            userTicketRepository.save(ticket);

            String region = resolveRegion(user, nearestSlot);

            Application app = applicationRepository.findByUserAndEventSlot(user, nearestSlot)
                    .map(existing -> {
                        existing.reapply(List.of(region), ticket);
                        return existing;
                    })
                    .orElseGet(() -> Application.builder()
                            .user(user)
                            .eventSlot(nearestSlot)
                            .ticket(ticket)
                            .status("APPLIED")
                            .preferredRegions(List.of(region))
                            .build());

            applicationRepository.save(app);

            RegionSlotId regionId = new RegionSlotId(nearestSlot.getId(), region);
            regionSlotRepository.findById(regionId).ifPresent(RegionSlot::incrementCount);

            appliedCount++;
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SIMULATION_APPLY_SLOT")
                .operatorName(operatorName)
                .detail(String.format("시뮬레이션: %d명 슬롯 #%d (%s) 참가 신청 완료", appliedCount, nearestSlot.getId(), nearestSlot.getEventDate()))
                .build());

        return Map.of("action", "APPLY_SLOT", "slotId", nearestSlot.getId(), "appliedUsers", appliedCount);
    }

    /**
     * 4. 참가 취소
     */
    @Transactional
    public Map<String, Object> cancelApplications(List<UUID> userIds, String operatorName) {
        List<User> users = resolveUsers(userIds);
        int cancelledCount = 0;

        for (User user : users) {
            var activeAppOpt = applicationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                    .filter(a -> !"CANCELLED".equals(a.getStatus()))
                    .findFirst();

            if (activeAppOpt.isPresent()) {
                try {
                    applicationService.cancelApplication(user.getId(), activeAppOpt.get().getId());
                    cancelledCount++;
                } catch (Exception e) {
                    log.warn("취소 시뮬레이션 에러 (user: {}): {}", user.getName(), e.getMessage());
                }
            }
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SIMULATION_CANCEL_APP")
                .operatorName(operatorName)
                .detail(String.format("시뮬레이션: %d명 참가 신청 취소 완료", cancelledCount))
                .build());

        return Map.of("action", "CANCEL_APPLICATION", "cancelledUsers", cancelledCount);
    }

    /**
     * 5. 매칭 완료 후 참가 취소 (MATCHED / CONFIRMED 상태에서 취소)
     */
    @Transactional
    public Map<String, Object> cancelAfterMatch(List<UUID> userIds, String operatorName) {
        List<User> users = resolveUsers(userIds);
        int cancelledCount = 0;

        for (User user : users) {
            var matchedAppOpt = applicationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                    .filter(a -> "MATCHED".equals(a.getStatus()) || "CONFIRMED".equals(a.getStatus()))
                    .findFirst();

            if (matchedAppOpt.isPresent()) {
                try {
                    applicationService.cancelApplication(user.getId(), matchedAppOpt.get().getId());
                    cancelledCount++;
                } catch (Exception e) {
                    log.warn("매칭 후 취소 시뮬레이션 에러 (user: {}): {}", user.getName(), e.getMessage());
                }
            }
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SIMULATION_CANCEL_AFTER_MATCH")
                .operatorName(operatorName)
                .detail(String.format("시뮬레이션: 매칭 상태 사용자 %d명 참가 취소 및 타 멤버 재매칭 풀 복귀 처리 완료", cancelledCount))
                .build());

        return Map.of("action", "CANCEL_AFTER_MATCH", "cancelledUsers", cancelledCount);
    }
}
