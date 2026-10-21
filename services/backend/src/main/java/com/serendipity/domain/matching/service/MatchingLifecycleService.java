package com.serendipity.domain.matching.service;

import com.serendipity.domain.admin.entity.AdminAuditLog;
import com.serendipity.domain.admin.repository.AdminAuditLogRepository;
import com.serendipity.domain.application.entity.Application;
import com.serendipity.domain.application.repository.ApplicationRepository;
import com.serendipity.domain.chat.entity.ChatMessage;
import com.serendipity.domain.chat.entity.ChatRoom;
import com.serendipity.domain.chat.repository.ChatMessageRepository;
import com.serendipity.domain.chat.repository.ChatRoomRepository;
import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.dining.entity.TableMember;
import com.serendipity.domain.dining.repository.DiningTableRepository;
import com.serendipity.domain.dining.repository.TableMemberRepository;
import com.serendipity.domain.notification.service.NotificationService;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.slot.repository.EventSlotRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserBlock;
import com.serendipity.domain.user.repository.UserBlockRepository;
import com.serendipity.domain.venue.entity.Venue;
import com.serendipity.domain.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingLifecycleService {

    private final ApplicationRepository applicationRepository;
    private final DiningTableRepository diningTableRepository;
    private final TableMemberRepository tableMemberRepository;
    private final VenueRepository venueRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final EventSlotRepository eventSlotRepository;
    private final UserBlockRepository userBlockRepository;
    private final NotificationService notificationService;
    private final AdminAuditLogRepository adminAuditLogRepository;
    private final com.serendipity.domain.notification.repository.NotificationRepository notificationRepository;
    private final RestTemplate restTemplate;

    @Value("${serendipity.ai-engine-url:http://ai-engine:8000}")
    private String aiEngineUrl;

    /**
     * 1. 월요일 정오(12:00) AI 1차 매칭 엔진 가동
     */
    @Transactional
    public Map<String, Object> runMondayNoonMatching(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        log.info("[매칭 라이프사이클] 1. 월요일 정오 매칭 엔진 가동 - 슬롯 #{}", slot.getId());

        List<Application> appliedList = applicationRepository.findByEventSlot(slot).stream()
                .filter(a -> "APPLIED".equals(a.getStatus()))
                .collect(Collectors.toList());

        Map<String, List<Application>> regionGroups = appliedList.stream()
                .collect(Collectors.groupingBy(a -> a.getPreferredRegions().isEmpty() ? "홍대 / 합정" : a.getPreferredRegions().get(0)));

        int createdTablesCount = 0;
        int matchedUsersCount = 0;
        List<UUID> matchedAppIds = new ArrayList<>();

        for (Map.Entry<String, List<Application>> entry : regionGroups.entrySet()) {
            String region = entry.getKey();
            List<Application> candidates = entry.getValue();

            List<List<Application>> matchedGroups = matchCandidatesViaAi(slot.getId(), region, candidates);

            for (List<Application> group : matchedGroups) {
                createdTablesCount++;
                int tableNo = diningTableRepository.findByEventSlot(slot).size() + 1;

                DiningTable table = DiningTable.builder()
                        .eventSlot(slot)
                        .tableNo(tableNo)
                        .region(region)
                        .venue(null) // 아직 확정 전이므로 식당 예약 미정
                        .status("MATCHED") // 최종 확정 대기 중
                        .reservationStatus("PENDING")
                        .harmonyScore(new BigDecimal("94.5"))
                        .maleCount((int) group.stream().filter(a -> "M".equals(a.getUser().getGender())).count())
                        .femaleCount((int) group.stream().filter(a -> "F".equals(a.getUser().getGender())).count())
                        .build();

                table = diningTableRepository.save(table);

                for (int i = 0; i < group.size(); i++) {
                    Application app = group.get(i);
                    app.matched();
                    applicationRepository.save(app);
                    matchedAppIds.add(app.getId());
                    matchedUsersCount++;

                    TableMember member = TableMember.builder()
                            .diningTable(table)
                            .user(app.getUser())
                            .role(i == 0 ? "HOST" : "MEMBER")
                            .status("SCHEDULED")
                            .build();
                    tableMemberRepository.save(member);

                    // 매칭 성공 알림 발송 (멤버 리스트 확인 안내 및 화요일 정오 확정 대기)
                    notificationService.sendToUser(
                            app.getUser(),
                            "MATCH",
                            "🎉 1차 매칭 완료! 함께할 멤버 리스트가 도착했습니다.",
                            "식당 예약 및 최종 확정은 화요일 정오(12:00)에 진행됩니다. 배정된 멤버 카드를 먼저 확인해보세요!",
                            "/match/result"
                    );
                }
            }
        }

        // 매칭 실패자(미배정) 안내 알림 (월요일 21시 재매칭 안내)
        List<Application> unmatchedList = appliedList.stream()
                .filter(a -> !matchedAppIds.contains(a.getId()))
                .collect(Collectors.toList());

        for (Application unApp : unmatchedList) {
            notificationService.sendToUser(
                    unApp.getUser(),
                    "REMATCH",
                    "매칭 조율 안내",
                    "현재 적합한 4인 테이블을 조율 중입니다. 오늘(월) 21:00에 AI 재매칭이 진행되므로 매칭 성공 시 바로 알려드리겠습니다!",
                    "/matching-waiting"
            );
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("AI_MATCH_RUN_MON_12")
                .operatorName("AI 매칭 엔진")
                .detail(String.format("월요일 정오 1차 매칭: 총 %d명 신청, %d개 테이블(%d명) 1차 매칭 성공, %d명 미매칭",
                        appliedList.size(), createdTablesCount, matchedUsersCount, unmatchedList.size()))
                .targetId(String.valueOf(slot.getId()))
                .build());

        Map<String, Object> result = new HashMap<>();
        result.put("step", "MONDAY_NOON");
        result.put("totalApplicants", appliedList.size());
        result.put("createdTables", createdTablesCount);
        result.put("matchedUsers", matchedUsersCount);
        result.put("unmatchedUsers", unmatchedList.size());
        return result;
    }

    /**
     * 2. 월요일 21:00 AI 재매칭 엔진 가동 (미매칭자 및 인원 변동 그룹 재매칭)
     */
    @Transactional
    public Map<String, Object> runMondayNightRematch(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        log.info("[매칭 라이프사이클] 2. 월요일 21시 AI 재매칭 엔진 가동 - 슬롯 #{}", slot.getId());

        List<Application> appliedList = applicationRepository.findByEventSlot(slot).stream()
                .filter(a -> "APPLIED".equals(a.getStatus()))
                .collect(Collectors.toList());

        Map<String, List<Application>> regionGroups = appliedList.stream()
                .collect(Collectors.groupingBy(a -> a.getPreferredRegions().isEmpty() ? "홍대 / 합정" : a.getPreferredRegions().get(0)));

        int createdTablesCount = 0;
        int matchedUsersCount = 0;
        List<UUID> matchedAppIds = new ArrayList<>();

        for (Map.Entry<String, List<Application>> entry : regionGroups.entrySet()) {
            String region = entry.getKey();
            List<Application> candidates = entry.getValue();

            List<List<Application>> matchedGroups = matchCandidatesViaAi(slot.getId(), region, candidates);

            for (List<Application> group : matchedGroups) {
                createdTablesCount++;
                int tableNo = diningTableRepository.findByEventSlot(slot).size() + 1;

                DiningTable table = DiningTable.builder()
                        .eventSlot(slot)
                        .tableNo(tableNo)
                        .region(region)
                        .venue(null)
                        .status("MATCHED")
                        .reservationStatus("PENDING")
                        .harmonyScore(new BigDecimal("93.0"))
                        .maleCount((int) group.stream().filter(a -> "M".equals(a.getUser().getGender())).count())
                        .femaleCount((int) group.stream().filter(a -> "F".equals(a.getUser().getGender())).count())
                        .build();

                table = diningTableRepository.save(table);

                for (int i = 0; i < group.size(); i++) {
                    Application app = group.get(i);
                    app.matched();
                    applicationRepository.save(app);
                    matchedAppIds.add(app.getId());
                    matchedUsersCount++;

                    TableMember member = TableMember.builder()
                            .diningTable(table)
                            .user(app.getUser())
                            .role(i == 0 ? "HOST" : "MEMBER")
                            .status("SCHEDULED")
                            .build();
                    tableMemberRepository.save(member);

                    notificationService.sendToUser(
                            app.getUser(),
                            "MATCH",
                            "🎉 2차 재매칭 성공! 멤버 리스트가 도착했습니다.",
                            "2차 재매칭에 성공하셨습니다! 화요일 정오에 식당 확정과 함께 모임이 최종 확정됩니다.",
                            "/match/result"
                    );
                }
            }
        }

        List<Application> unmatchedList = appliedList.stream()
                .filter(a -> !matchedAppIds.contains(a.getId()))
                .collect(Collectors.toList());

        for (Application unApp : unmatchedList) {
            notificationService.sendToUser(
                    unApp.getUser(),
                    "REMATCH",
                    "재매칭 진행 현황 안내",
                    "내일(화) 오전 8시에 최종 재매칭이 진행됩니다.",
                    "/matching-waiting"
            );
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("AI_REMATCH_RUN_MON_21")
                .operatorName("AI 매칭 엔진")
                .detail(String.format("월요일 21시 2차 재매칭: 대상 %d명, %d개 테이블(%d명) 추가 매칭, %d명 미매칭",
                        appliedList.size(), createdTablesCount, matchedUsersCount, unmatchedList.size()))
                .targetId(String.valueOf(slot.getId()))
                .build());

        Map<String, Object> result = new HashMap<>();
        result.put("step", "MONDAY_NIGHT");
        result.put("candidates", appliedList.size());
        result.put("createdTables", createdTablesCount);
        result.put("matchedUsers", matchedUsersCount);
        result.put("unmatchedUsers", unmatchedList.size());
        return result;
    }

    /**
     * 3. 화요일 오전 8:00 최종 재매칭 및 최종 실패 처리 (참가권 자동 반환)
     */
    @Transactional
    public Map<String, Object> runTuesdayMorningRematch(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        log.info("[매칭 라이프사이클] 3. 화요일 08:00 최종 재매칭 및 최종 실패 처리 - 슬롯 #{}", slot.getId());

        List<Application> appliedList = applicationRepository.findByEventSlot(slot).stream()
                .filter(a -> "APPLIED".equals(a.getStatus()))
                .collect(Collectors.toList());

        Map<String, List<Application>> regionGroups = appliedList.stream()
                .collect(Collectors.groupingBy(a -> a.getPreferredRegions().isEmpty() ? "홍대 / 합정" : a.getPreferredRegions().get(0)));

        int createdTablesCount = 0;
        int matchedUsersCount = 0;
        List<UUID> matchedAppIds = new ArrayList<>();

        for (Map.Entry<String, List<Application>> entry : regionGroups.entrySet()) {
            String region = entry.getKey();
            List<Application> candidates = entry.getValue();

            List<List<Application>> matchedGroups = matchCandidatesViaAi(slot.getId(), region, candidates);

            for (List<Application> group : matchedGroups) {
                createdTablesCount++;
                int tableNo = diningTableRepository.findByEventSlot(slot).size() + 1;

                DiningTable table = DiningTable.builder()
                        .eventSlot(slot)
                        .tableNo(tableNo)
                        .region(region)
                        .venue(null)
                        .status("MATCHED")
                        .reservationStatus("PENDING")
                        .harmonyScore(new BigDecimal("91.5"))
                        .maleCount((int) group.stream().filter(a -> "M".equals(a.getUser().getGender())).count())
                        .femaleCount((int) group.stream().filter(a -> "F".equals(a.getUser().getGender())).count())
                        .build();

                table = diningTableRepository.save(table);

                for (int i = 0; i < group.size(); i++) {
                    Application app = group.get(i);
                    app.matched();
                    applicationRepository.save(app);
                    matchedAppIds.add(app.getId());
                    matchedUsersCount++;

                    TableMember member = TableMember.builder()
                            .diningTable(table)
                            .user(app.getUser())
                            .role(i == 0 ? "HOST" : "MEMBER")
                            .status("SCHEDULED")
                            .build();
                    tableMemberRepository.save(member);

                    notificationService.sendToUser(
                            app.getUser(),
                            "MATCH",
                            "🎉 최종 재매칭 성공!",
                            "오전 8시 재매칭이 성공했습니다! 오늘(화) 정오에 식당과 모임이 최종 확정됩니다.",
                            "/match/result"
                    );
                }
            }
        }

        // 최종 실패 처리: 참가권 반환 및 알림
        List<Application> finalFailedList = appliedList.stream()
                .filter(a -> !matchedAppIds.contains(a.getId()))
                .collect(Collectors.toList());

        for (Application failedApp : finalFailedList) {
            failedApp.failFallback();
            if (failedApp.getTicket() != null) {
                failedApp.getTicket().restore();
            }
            applicationRepository.save(failedApp);

            notificationService.sendToUser(
                    failedApp.getUser(),
                    "FALLBACK",
                    "이번 주 식탁 매칭 최종 실패 안내",
                    "이번 주 적합한 4인 테이블을 성사시키지 못했습니다. 신청 시 사용하신 참가권 1회가 보유 참가권으로 안전하게 반환되었습니다.",
                    "/match/fallback"
            );
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("AI_FINAL_REMATCH_TUE_08")
                .operatorName("AI 매칭 엔진")
                .detail(String.format("화요일 08:00 최종 재매칭: 성공 %d명, 최종 실패 %d명 참가권 반환 완료",
                        matchedUsersCount, finalFailedList.size()))
                .targetId(String.valueOf(slot.getId()))
                .build());

        Map<String, Object> result = new HashMap<>();
        result.put("step", "TUESDAY_MORNING");
        result.put("createdTables", createdTablesCount);
        result.put("matchedUsers", matchedUsersCount);
        result.put("finalFailedAndRefundedUsers", finalFailedList.size());
        return result;
    }

    /**
     * 4. 화요일 정오(12:00) 매칭 최종 확정, 채팅방 개설, 식당 예약 진행
     */
    @Transactional
    public Map<String, Object> runTuesdayNoonFinalConfirmation(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        log.info("[매칭 라이프사이클] 4. 화요일 정오 최종 확정 & 식당 예약 & 채팅방 개설 - 슬롯 #{}", slot.getId());

        List<DiningTable> matchedTables = diningTableRepository.findByEventSlot(slot).stream()
                .filter(t -> "MATCHED".equals(t.getStatus()))
                .collect(Collectors.toList());

        List<Venue> activeVenues = venueRepository.findAll();

        int confirmedCount = 0;
        int openedChatRooms = 0;

        for (DiningTable table : matchedTables) {
            table.updateStatus("CONFIRMED");

            // 1. 식당 배정 및 예약 (권역 일치 식당 우선 배정)
            String targetRegKey = table.getRegion() != null ? table.getRegion().replaceAll("\\s+", "") : "";
            Venue venue = activeVenues.stream()
                    .filter(v -> {
                        String vKey = v.getRegion() != null ? v.getRegion().replaceAll("\\s+", "") : "";
                        return targetRegKey.contains(vKey) || vKey.contains(targetRegKey) || targetRegKey.startsWith(vKey.split("/")[0]);
                    })
                    .findFirst()
                    .orElseGet(() -> !activeVenues.isEmpty() ? activeVenues.get(0) : null);

            if (venue != null) {
                table.assignVenue(venue);
                table.updateReservationStatus("RESERVED");
            } else {
                table.updateReservationStatus("FAILED");
            }
            diningTableRepository.save(table);

            // 2. 채팅방 개설
            ChatRoom chatRoom = chatRoomRepository.findByDiningTable(table)
                    .orElseGet(() -> chatRoomRepository.save(ChatRoom.builder().diningTable(table).build()));
            openedChatRooms++;

            // 3. 채팅방에 식당 예약 확정 공지 등록
            if (venue != null) {
                ChatMessage notice = ChatMessage.builder()
                        .chatRoom(chatRoom)
                        .sender(null)
                        .senderRole("ADMIN")
                        .messageType("VENUE_CARD")
                        .content(String.format("[식당 예약 확정] %s (%s) 테이블 예약이 완료되었습니다! (예약자명: 우연한 식탁)",
                                venue.getName(), venue.getAddress()))
                        .build();
                chatMessageRepository.save(notice);
            }

            // 4. 멤버들 신청 상태 CONFIRMED 갱신 및 최종 확정 알림 발송
            List<TableMember> members = tableMemberRepository.findByDiningTable(table);
            for (TableMember member : members) {
                applicationRepository.findByUserAndEventSlot(member.getUser(), slot).ifPresent(app -> {
                    app.confirm();
                    applicationRepository.save(app);
                });

                String venueDesc = (venue != null)
                        ? String.format("배정 식당: %s (%s). 4인 단체 채팅방이 개설되었습니다. 입장해보세요!", venue.getName(), venue.getAddress())
                        : "식당 예약이 조율 중입니다. 곧 채팅방으로 안내됩니다.";

                notificationService.sendToUser(
                        member.getUser(),
                        "CONFIRMED",
                        "🎉 목요일 식탁 최종 확정 & 식당 예약 완료!",
                        venueDesc,
                        "/match/result"
                );
            }

            confirmedCount++;
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("FINAL_CONFIRM_TUE_12")
                .operatorName("운영 시스템")
                .detail(String.format("화요일 정오 매칭 최종 확정: %d개 테이블 확정, %d개 채팅방 개설 및 식당 예약 완료",
                        confirmedCount, openedChatRooms))
                .targetId(String.valueOf(slot.getId()))
                .build());

        Map<String, Object> result = new HashMap<>();
        result.put("step", "TUESDAY_NOON");
        result.put("confirmedTables", confirmedCount);
        result.put("chatRoomsOpened", openedChatRooms);
        return result;
    }

    /**
     * 5. 화요일 16:00 식당 미배정 테이블 예외큐(Admin Exception Queue) 전달
     */
    @Transactional
    public Map<String, Object> checkTuesday16UnreservedVenues(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        log.info("[매칭 라이프사이클] 5. 화요일 16:00 미예약 식당 예외큐 확인 - 슬롯 #{}", slot.getId());

        List<DiningTable> unreserved = diningTableRepository.findByEventSlot(slot).stream()
                .filter(t -> "CONFIRMED".equals(t.getStatus()))
                .filter(t -> t.getVenue() == null || !"RESERVED".equals(t.getReservationStatus()))
                .collect(Collectors.toList());

        for (DiningTable table : unreserved) {
            table.updateStatus("UNDER_QUORUM"); // 예외 관리 큐에서 감지하도록 설정
            diningTableRepository.save(table);

            adminAuditLogRepository.save(AdminAuditLog.builder()
                    .actionType("RESERVATION_EXCEPTION")
                    .operatorName("시스템 알람")
                    .detail(String.format("화요일 16:00 식당 미예약 예외 발생: 테이블 #%d (%s 권역), 관리자 수동 개입 필요",
                            table.getTableNo(), table.getRegion()))
                    .targetId(String.valueOf(table.getId()))
                    .build());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("step", "TUESDAY_16");
        result.put("unreservedExceptions", unreserved.size());
        return result;
    }

    /**
     * 6. 모임 당일(목) 12:00 리마인드 알림 발송 (식당 및 예약 정보 표시)
     */
    @Transactional
    public Map<String, Object> sendEventDayNoonReminder(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        List<DiningTable> tables = diningTableRepository.findByEventSlot(slot).stream()
                .filter(t -> "CONFIRMED".equals(t.getStatus()))
                .collect(Collectors.toList());

        int sentCount = 0;
        for (DiningTable table : tables) {
            String venueName = table.getVenue() != null ? table.getVenue().getName() : "배정된 식당";
            String venueAddr = table.getVenue() != null ? table.getVenue().getAddress() : "";
            String timeStr = slot.getEventTime() != null ? slot.getEventTime().toString().substring(0, 5) : "19:30";

            chatRoomRepository.findByDiningTable(table).ifPresent(room -> {
                ChatMessage msg = ChatMessage.builder()
                        .chatRoom(room)
                        .sender(null)
                        .senderRole("ADMIN")
                        .messageType("SYSTEM")
                        .content(String.format("📍 [D-Day 모임 리마인드] 오늘 저녁 %s 모임 날입니다! 식당: %s (%s)",
                                timeStr, venueName, venueAddr))
                        .build();
                chatMessageRepository.save(msg);
            });

            List<TableMember> members = tableMemberRepository.findByDiningTable(table);
            for (TableMember member : members) {
                notificationService.sendToUser(
                        member.getUser(),
                        "REMINDER",
                        "📍 [오늘 D-Day] 우연한 식탁 모임 안내",
                        String.format("오늘 저녁 %s, %s(%s)에서 만나요! 늦지 않게 도착해 주세요.", timeStr, venueName, venueAddr),
                        "/chat"
                );
                sentCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("step", "EVENT_DAY_NOON");
        result.put("remindersSent", sentCount);
        return result;
    }

    /**
     * 7. 모임 당일 30분 전(19:00) 리마인드 알림 발송
     */
    @Transactional
    public Map<String, Object> sendEventDay30MinReminder(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        List<DiningTable> tables = diningTableRepository.findByEventSlot(slot).stream()
                .filter(t -> "CONFIRMED".equals(t.getStatus()))
                .collect(Collectors.toList());

        int sentCount = 0;
        for (DiningTable table : tables) {
            chatRoomRepository.findByDiningTable(table).ifPresent(room -> {
                ChatMessage msg = ChatMessage.builder()
                        .chatRoom(room)
                        .sender(null)
                        .senderRole("ADMIN")
                        .messageType("SYSTEM")
                        .content("⏰ 모임 30분 전입니다! 식당 도착 후 단체 채팅방에서 [도착 체크인]을 눌러주세요.")
                        .build();
                chatMessageRepository.save(msg);
            });

            for (TableMember member : tableMemberRepository.findByDiningTable(table)) {
                notificationService.sendToUser(
                        member.getUser(),
                        "REMINDER",
                        "⏰ 모임 30분 전! 늦지 않게 도착해 주세요",
                        "식당에 도착하시면 채팅방에서 [도착 체크인] 버튼을 눌러 참석을 알려주세요.",
                        "/chat"
                );
                sentCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("step", "EVENT_DAY_30M");
        result.put("remindersSent", sentCount);
        return result;
    }

    /**
     * 8. 모임 시작 시간(19:30) 시작 알림 발송
     */
    @Transactional
    public Map<String, Object> sendEventDayStartNotice(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        List<DiningTable> tables = diningTableRepository.findByEventSlot(slot).stream()
                .filter(t -> "CONFIRMED".equals(t.getStatus()))
                .collect(Collectors.toList());

        int sentCount = 0;
        for (DiningTable table : tables) {
            chatRoomRepository.findByDiningTable(table).ifPresent(room -> {
                ChatMessage msg = ChatMessage.builder()
                        .chatRoom(room)
                        .sender(null)
                        .senderRole("ADMIN")
                        .messageType("SYSTEM")
                        .content("🍷 우연한 식탁이 시작되었습니다! 서로를 존중하며 따뜻하고 즐거운 대화 나누세요.")
                        .build();
                chatMessageRepository.save(msg);
            });

            for (TableMember member : tableMemberRepository.findByDiningTable(table)) {
                notificationService.sendToUser(
                        member.getUser(),
                        "REMINDER",
                        "🍷 우연한 식탁이 시작되었습니다!",
                        "함께한 멤버들과 서로를 존중하며 즐겁고 따뜻한 시간 되세요.",
                        "/chat"
                );
                sentCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("step", "EVENT_DAY_START");
        result.put("noticesSent", sentCount);
        return result;
    }

    /**
     * 9. 모임 다음날(금) 정오(12:00) 피드백 요청 알림 발송
     */
    @Transactional
    public Map<String, Object> sendNextDayFeedbackRequest(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        List<DiningTable> tables = diningTableRepository.findByEventSlot(slot).stream()
                .filter(t -> "CONFIRMED".equals(t.getStatus()))
                .collect(Collectors.toList());

        int sentCount = 0;
        for (DiningTable table : tables) {
            for (TableMember member : tableMemberRepository.findByDiningTable(table)) {
                notificationService.sendToUser(
                        member.getUser(),
                        "FEEDBACK",
                        "💌 어제 모임은 어떠셨나요?",
                        "솔직한 다이닝 평점과 후기를 남겨주세요. 비공개 매칭 선호도(재매칭 희망/제외 멤버)도 반영할 수 있습니다.",
                        "/feedback"
                );
                sentCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("step", "NEXT_DAY_FEEDBACK");
        result.put("feedbacksRequested", sentCount);
        return result;
    }

    /**
     * 10. 매칭 정보 초기화 (테이블, 멤버, 채팅방/메시지 삭제 및 신청 상태 APPLIED 복구)
     */
    @Transactional
    public Map<String, Object> resetMatchingData(Long slotId) {
        EventSlot slot = resolveSlot(slotId);
        log.info("[매칭 라이프사이클] 10. 매칭 정보 초기화 실행 - 슬롯 #{}", slot.getId());

        List<DiningTable> tables = diningTableRepository.findByEventSlot(slot);
        int deletedTablesCount = tables.size();
        int deletedMembersCount = 0;
        int deletedChatRoomsCount = 0;

        for (DiningTable table : tables) {
            // 1. 단체 채팅방 및 메시지 삭제
            var chatRoomOpt = chatRoomRepository.findByDiningTable(table);
            if (chatRoomOpt.isPresent()) {
                ChatRoom room = chatRoomOpt.get();
                chatMessageRepository.deleteByChatRoom(room);
                chatRoomRepository.delete(room);
                deletedChatRoomsCount++;
            }

            // 2. 테이블 멤버 삭제
            List<TableMember> members = tableMemberRepository.findByDiningTable(table);
            deletedMembersCount += members.size();
            tableMemberRepository.deleteAll(members);

            // 3. 다이닝 테이블 삭제
            diningTableRepository.delete(table);
        }

        // 4. 해당 슬롯의 신청자 상태 초기화 (CANCELLED가 아닌 MATCHED/CONFIRMED를 APPLIED로 롤백)
        List<Application> apps = applicationRepository.findByEventSlot(slot);
        int resetAppsCount = 0;
        for (Application app : apps) {
            if ("MATCHED".equals(app.getStatus()) || "CONFIRMED".equals(app.getStatus())) {
                app.resetToApplied();
                applicationRepository.save(app);
                resetAppsCount++;
            }
        }

        // 5. 모든 사용자의 알림 내역 삭제 (테스트 흐름을 처음부터 재현하기 위함)
        long deletedNotifications = notificationRepository.count();
        notificationRepository.deleteAllInBatch();

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("MATCHING_RESET")
                .operatorName("관리자")
                .detail(String.format("매칭 정보 초기화 완료: 슬롯 #%d, 삭제 테이블 %d개, 삭제 멤버 %d명, 초기화 신청건 %d건",
                        slot.getId(), deletedTablesCount, deletedMembersCount, resetAppsCount))
                .targetId(String.valueOf(slot.getId()))
                .build());

        Map<String, Object> result = new HashMap<>();
        result.put("step", "RESET");
        result.put("deletedTables", deletedTablesCount);
        result.put("deletedMembers", deletedMembersCount);
        result.put("deletedChatRooms", deletedChatRoomsCount);
        result.put("resetApplications", resetAppsCount);
        result.put("deletedNotifications", deletedNotifications);
        return result;
    }

    // -------------------------------------------------------------
    // 내부 헬퍼 함수들
    // -------------------------------------------------------------

    private EventSlot resolveSlot(Long slotId) {
        if (slotId != null) {
            var opt = eventSlotRepository.findById(slotId);
            if (opt.isPresent()) {
                return opt.get();
            }
            log.warn("[매칭 라이프사이클] 요청된 슬롯 #{} 가 존재하지 않아 가장 가까운 활성 슬롯으로 대체합니다.", slotId);
        }
        return eventSlotRepository.findByEventDateGreaterThanEqualOrderByEventDateAsc(java.time.LocalDate.now()).stream()
                .findFirst()
                .or(() -> eventSlotRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new IllegalStateException("등록된 슬롯이 없습니다."));
    }

    /**
     * AI Engine HTTP 통신 또는 fallback 4인 매칭 알고리즘
     */
    private List<List<Application>> matchCandidatesViaAi(Long slotId, String region, List<Application> candidates) {
        if (candidates.size() < 4) {
            return Collections.emptyList();
        }

        try {
            // 후보자 프로필 및 기피 목록(avoidUserIds) 구성
            List<Map<String, Object>> candidatePayloads = new ArrayList<>();
            for (Application app : candidates) {
                User u = app.getUser();
                List<String> avoidIds = userBlockRepository.findBlockedUserIdsByUserId(u.getId()).stream()
                        .map(UUID::toString)
                        .collect(Collectors.toList());

                Map<String, Object> p = new HashMap<>();
                p.put("userId", u.getId().toString());
                p.put("birthYear", u.getBirthYear() != null ? u.getBirthYear() : 1995);
                p.put("gender", u.getGender() != null ? u.getGender() : "F");
                p.put("mbti", u.getMbti() != null ? u.getMbti() : "ENFP");
                p.put("interests", u.getInterests() != null && !u.getInterests().isEmpty() ? u.getInterests() : List.of("맛집·카페 탐방"));
                p.put("myTendencies", u.getMyTendencies() != null && !u.getMyTendencies().isEmpty() ? u.getMyTendencies() : List.of("깊은 대화"));
                p.put("preferredTendencies", u.getPreferredTendencies() != null && !u.getPreferredTendencies().isEmpty() ? u.getPreferredTendencies() : List.of("경청"));
                p.put("budgetRanges", u.getBudgetRanges() != null && !u.getBudgetRanges().isEmpty() ? u.getBudgetRanges() : List.of("20,000~30,000원"));
                p.put("avoidUserIds", avoidIds);
                candidatePayloads.add(p);
            }

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("slotId", slotId);
            reqBody.put("region", region);
            reqBody.put("candidates", candidatePayloads);

            ResponseEntity<Map> resp = restTemplate.postForEntity(aiEngineUrl + "/api/match", reqBody, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                List<Map<String, Object>> tables = (List<Map<String, Object>>) resp.getBody().get("confirmedTables");
                if (tables != null && !tables.isEmpty()) {
                    Map<String, Application> appMap = candidates.stream()
                            .collect(Collectors.toMap(a -> a.getUser().getId().toString(), a -> a, (k1, k2) -> k1));

                    List<List<Application>> result = new ArrayList<>();
                    for (Map<String, Object> t : tables) {
                        List<String> memberIds = (List<String>) t.get("memberIds");
                        List<Application> group = memberIds.stream()
                                .map(appMap::get)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
                        if (group.size() >= 4 && group.size() <= 6) {
                            result.add(group);
                        }
                    }
                    if (!result.isEmpty()) return result;
                }
            }
        } catch (Exception e) {
            log.warn("[AI Engine 통신 오류, 내장 휴리스틱 알고리즘으로 전환] {}", e.getMessage());
        }

        // Fallback: 4~6명 단위 그룹 분할 (남녀 성비 균형 유지 시도)
        List<List<Application>> fallbackGroups = new ArrayList<>();
        List<Application> males = candidates.stream().filter(c -> "M".equals(c.getUser().getGender())).collect(Collectors.toList());
        List<Application> females = candidates.stream().filter(c -> !"M".equals(c.getUser().getGender())).collect(Collectors.toList());

        while (males.size() >= 2 && females.size() >= 2) {
            List<Application> group = new ArrayList<>();
            group.add(males.remove(0));
            group.add(males.remove(0));
            group.add(females.remove(0));
            group.add(females.remove(0));
            fallbackGroups.add(group);
        }

        // 남은 인원 중 4~6명이 채워질 수 있는 경우 추가 그룹 구성
        List<Application> leftovers = new ArrayList<>();
        leftovers.addAll(males);
        leftovers.addAll(females);
        while (leftovers.size() >= 4) {
            int take = (leftovers.size() == 5 || leftovers.size() == 6) ? leftovers.size() : 4;
            fallbackGroups.add(new ArrayList<>(leftovers.subList(0, take)));
            leftovers = leftovers.subList(take, leftovers.size());
        }

        return fallbackGroups;
    }
}
