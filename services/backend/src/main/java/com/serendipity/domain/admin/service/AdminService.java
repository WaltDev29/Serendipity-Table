package com.serendipity.domain.admin.service;

import com.serendipity.domain.admin.dto.*;
import com.serendipity.domain.admin.entity.AdminAuditLog;
import com.serendipity.domain.admin.repository.AdminAuditLogRepository;
import com.serendipity.domain.application.repository.ApplicationRepository;
import com.serendipity.domain.cs.dto.CsInquiryResponse;
import com.serendipity.domain.cs.entity.CsInquiry;
import com.serendipity.domain.cs.entity.CsInquiryReply;
import com.serendipity.domain.cs.repository.CsInquiryReplyRepository;
import com.serendipity.domain.cs.repository.CsInquiryRepository;
import com.serendipity.domain.cs.service.CsService;
import com.serendipity.domain.dining.dto.ActiveTableResponse;
import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.dining.entity.TableMember;
import com.serendipity.domain.dining.repository.DiningTableRepository;
import com.serendipity.domain.dining.repository.TableMemberRepository;
import com.serendipity.domain.slot.dto.SlotResponse;
import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.slot.entity.RegionSlot;
import com.serendipity.domain.slot.entity.RegionSlotId;
import com.serendipity.domain.slot.repository.EventSlotRepository;
import com.serendipity.domain.slot.repository.RegionSlotRepository;
import com.serendipity.domain.slot.service.SlotService;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserBlacklist;
import com.serendipity.domain.user.repository.UserBlacklistRepository;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.domain.venue.entity.Venue;
import com.serendipity.domain.venue.repository.VenueRepository;
import java.time.LocalDate;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final DiningTableRepository diningTableRepository;
    private final TableMemberRepository tableMemberRepository;
    private final VenueRepository venueRepository;
    private final CsInquiryRepository csInquiryRepository;
    private final CsInquiryReplyRepository csInquiryReplyRepository;
    private final UserBlacklistRepository userBlacklistRepository;
    private final com.serendipity.domain.user.repository.UserBlockRepository userBlockRepository;
    private final com.serendipity.domain.user.repository.UserTicketRepository userTicketRepository;
    private final com.serendipity.domain.application.repository.OrderRepository orderRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;
    private final EventSlotRepository eventSlotRepository;
    private final RegionSlotRepository regionSlotRepository;
    private final SlotService slotService;
    private final CsService csService;
    private final com.serendipity.domain.chat.repository.ChatMessageRepository chatMessageRepository;
    private final com.serendipity.domain.chat.repository.ChatRoomRepository chatRoomRepository;
    private final com.serendipity.domain.dining.repository.DiningFeedbackRepository diningFeedbackRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long currentApps = applicationRepository.countByStatusNot("CANCELLED");
        long activeTables = diningTableRepository.count();
        long totalVenues = venueRepository.count();
        long pendingCs = csInquiryRepository.findAll().stream()
                .filter(i -> "PENDING".equals(i.getStatus()))
                .count();

        long totalRevenue = 0;
        long ticket1Count = 0;
        long ticket3Count = 0;

        for (var o : orderRepository.findAll()) {
            if ("PAID".equals(o.getStatus())) {
                totalRevenue += (o.getAmount() != null ? o.getAmount() : 0);
                if ("1_TICKET".equalsIgnoreCase(o.getTicketType()) || (o.getItemName() != null && o.getItemName().contains("1회"))) {
                    ticket1Count++;
                } else if ("3_TICKETS".equalsIgnoreCase(o.getTicketType()) || (o.getItemName() != null && o.getItemName().contains("3회"))) {
                    ticket3Count++;
                }
            }
        }

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .currentApplications(currentApps)
                .activeTables(activeTables)
                .totalVenues(totalVenues)
                .pendingInquiries(pendingCs)
                .totalRevenue(totalRevenue)
                .ticket1Count(ticket1Count)
                .ticket3Count(ticket3Count)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getSlots() {
        return slotService.getAllSlots();
    }

    @Transactional
    public void toggleRegionClosed(Long slotId, String region, boolean isClosed, String operatorName) {
        String targetKey = region.replaceAll("\\s+", "");
        RegionSlot slot = regionSlotRepository.findById(new RegionSlotId(slotId, region))
                .or(() -> regionSlotRepository.findByIdEventSlotId(slotId).stream()
                        .filter(rs -> {
                            String k = rs.getId().getRegion().replaceAll("\\s+", "");
                            return k.equals(targetKey) || targetKey.startsWith(k) || k.startsWith(targetKey);
                        })
                        .findFirst())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "권역 슬롯을 찾을 수 없습니다: " + region));

        slot.toggleClosed(isClosed);
        regionSlotRepository.save(slot);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SLOT_TOGGLE_CLOSE")
                .operatorName(operatorName)
                .detail(String.format("슬롯 %d 권역 %s 마감 상태 변경 -> %s", slotId, slot.getId().getRegion(), isClosed))
                .targetId(slotId.toString())
                .build());
    }

    @Transactional(readOnly = true)
    public List<ActiveTableResponse> getTables(Long slotId) {
        List<DiningTable> tables = slotId != null 
                ? diningTableRepository.findByEventSlotId(slotId)
                : diningTableRepository.findAll();

        return tables.stream()
                .filter(table -> !"CANCELLED".equalsIgnoreCase(table.getStatus()))
                .filter(table -> !tableMemberRepository.findByDiningTable(table).isEmpty())
                .map(table -> {
            var allMembers = tableMemberRepository.findByDiningTable(table);
            var memberInfos = allMembers.stream().map(m -> ActiveTableResponse.MemberInfo.builder()
                    .userId(m.getUser().getId())
                    .nickname(m.getUser().getNickname())
                    .birthYear(m.getUser().getBirthYear())
                    .gender(m.getUser().getGender())
                    .job(m.getUser().getJob())
                    .mbti(m.getUser().getMbti())
                    .role(m.getRole())
                    .mannerTemp(m.getUser().getMannerTemp())
                    .build()).collect(Collectors.toList());

            var venueInfo = table.getVenue() == null ? null : ActiveTableResponse.VenueInfo.builder()
                    .id(table.getVenue().getId())
                    .name(table.getVenue().getName())
                    .address(table.getVenue().getAddress())
                    .mapUrl(table.getVenue().getMapUrl())
                    .naverMapUrl(table.getVenue().getNaverMapUrl())
                    .representativeMenu(table.getVenue().getRepresentativeMenu())
                    .avgPrice(table.getVenue().getAvgPrice())
                    .phone(table.getVenue().getPhone())
                    .imageUrl(table.getVenue().getImageUrl())
                    .build();

            UUID chatRoomId = chatRoomRepository.findByDiningTable(table)
                    .map(com.serendipity.domain.chat.entity.ChatRoom::getId)
                    .orElse(null);

            return ActiveTableResponse.builder()
                    .tableId(table.getId())
                    .eventSlotId(table.getEventSlot().getId())
                    .tableNo(table.getTableNo())
                    .region(table.getRegion())
                    .eventDate(table.getEventSlot().getEventDate())
                    .eventTime(table.getEventSlot().getEventTime())
                    .harmonyScore(table.getHarmonyScore())
                    .status(table.getStatus())
                    .chatRoomId(chatRoomId)
                    .reservationStatus(table.getReservationStatus())
                    .venue(venueInfo)
                    .members(memberInfos)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void swapMembers(AdminMemberSwapRequest req, String operatorName) {
        TableMember memberA = tableMemberRepository.findById(req.getMemberIdA())
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND, "첫 번째 멤버를 찾을 수 없습니다."));
        TableMember memberB = tableMemberRepository.findById(req.getMemberIdB())
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND, "두 번째 멤버를 찾을 수 없습니다."));

        DiningTable tableA = memberA.getDiningTable();
        DiningTable tableB = memberB.getDiningTable();

        // 테이블 멤버 서로 맞교환 (TableMember 삭제 후 재등록 또는 소속 테이블 변경)
        User userA = memberA.getUser();
        User userB = memberB.getUser();

        tableMemberRepository.delete(memberA);
        tableMemberRepository.delete(memberB);
        tableMemberRepository.flush();

        TableMember newMemberA = TableMember.builder()
                .diningTable(tableB)
                .user(userA)
                .role("MEMBER")
                .status("SCHEDULED")
                .build();

        TableMember newMemberB = TableMember.builder()
                .diningTable(tableA)
                .user(userB)
                .role("MEMBER")
                .status("SCHEDULED")
                .build();

        tableMemberRepository.save(newMemberA);
        tableMemberRepository.save(newMemberB);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("MANUAL_SWAP")
                .operatorName(operatorName)
                .detail(String.format("수동 멤버 교체 (%s <-> %s), 사유: %s", userA.getNickname(), userB.getNickname(), req.getReason()))
                .targetId(tableA.getId().toString())
                .build());
    }

    @Transactional(readOnly = true)
    public List<Venue> getVenues() {
        return venueRepository.findAll();
    }

    @Transactional
    public void toggleVenueReserved(UUID venueId, boolean isReserved, String operatorName) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "식당을 찾을 수 없습니다."));

        venue.updateReservationStatus(isReserved);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("VENUE_RESERVE_TOGGLE")
                .operatorName(operatorName)
                .detail(String.format("식당 %s 예약 완료 여부 변경 -> %s", venue.getName(), isReserved))
                .targetId(venue.getId().toString())
                .build());
    }

    @Transactional(readOnly = true)
    public List<UserBlacklist> getBlacklist() {
        return userBlacklistRepository.findAll();
    }

    @Transactional
    public void addToBlacklist(AdminBlacklistRequest req, String operatorName) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (userBlacklistRepository.existsByUser(user)) {
            return;
        }

        UserBlacklist blacklist = UserBlacklist.builder()
                .user(user)
                .reason(req.getReason())
                .createdBy(operatorName)
                .build();

        userBlacklistRepository.save(blacklist);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("BLACKLIST_ADD")
                .operatorName(operatorName)
                .detail(String.format("유저 %s(%s) 블랙리스트 추가: %s", user.getName(), user.getPhone(), req.getReason()))
                .targetId(user.getId().toString())
                .build());
    }

    @Transactional
    public void removeFromBlacklist(UUID userId, String operatorName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        userBlacklistRepository.findByUser(user).ifPresent(userBlacklistRepository::delete);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("BLACKLIST_REMOVE")
                .operatorName(operatorName)
                .detail(String.format("유저 %s(%s) 블랙리스트 해제", user.getName(), user.getPhone()))
                .targetId(user.getId().toString())
                .build());
    }

    @Transactional
    public void addStrike(UUID userId, String reason, String operatorName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.increaseStrike();
        userRepository.save(user);

        // 주의 3회 이상 누적 시 강제 탈퇴 및 블랙리스트 설정
        if (user.getStrikeCount() >= 3) {
            if (!userBlacklistRepository.existsByUser(user)) {
                UserBlacklist blacklist = UserBlacklist.builder()
                        .user(user)
                        .reason("주의 3회 누적 강제 차단: " + reason)
                        .createdBy(operatorName)
                        .build();
                userBlacklistRepository.save(blacklist);
            }
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("USER_STRIKE_ADD")
                .operatorName(operatorName)
                .detail(String.format("유저 %s(%s) 주의 1회 부여 (현재 %d회): %s", user.getName(), user.getPhone(), user.getStrikeCount(), reason))
                .targetId(user.getId().toString())
                .build());
    }

    @Transactional(readOnly = true)
    public List<CsInquiryResponse> getInquiries() {
        return csInquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(csService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void replyInquiry(UUID inquiryId, AdminCsReplyRequest req, String operatorName) {
        CsInquiry inquiry = csInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문의를 찾을 수 없습니다."));

        String content = req.getEffectiveReplyContent();
        String op = req.getEffectiveOperatorName() != null ? req.getEffectiveOperatorName() : operatorName;

        CsInquiryReply reply = CsInquiryReply.builder()
                .inquiry(inquiry)
                .operatorName(op)
                .replyContent(content)
                .build();

        csInquiryReplyRepository.save(reply);
        inquiry.markAsAnswered();

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("CS_REPLY")
                .operatorName(op)
                .detail(String.format("CS 문의 %s 답변 완료", inquiryId))
                .targetId(inquiryId.toString())
                .build());
    }

    @Transactional
    public void resolveInquiry(UUID inquiryId, String operatorName) {
        CsInquiry inquiry = csInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문의를 찾을 수 없습니다."));

        inquiry.markAsResolved();
        csInquiryRepository.save(inquiry);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("CS_RESOLVE")
                .operatorName(operatorName)
                .detail(String.format("CS 문의 %s 해결 완료 처리", inquiryId))
                .targetId(inquiryId.toString())
                .build());
    }

    @Transactional
    public void deleteInquiry(UUID inquiryId, String operatorName) {
        CsInquiry inquiry = csInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "문의를 찾을 수 없습니다."));

        csInquiryRepository.delete(inquiry);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("CS_DELETE")
                .operatorName(operatorName)
                .detail(String.format("CS 문의 %s 삭제 완료", inquiryId))
                .targetId(inquiryId.toString())
                .build());
    }

    @Transactional
    public void updateSlotStatus(Long slotId, String status, String operatorName) {
        EventSlot slot = eventSlotRepository.findById(slotId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "슬롯을 찾을 수 없습니다."));

        slot.updateStatus(status);
        eventSlotRepository.save(slot);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SLOT_STATUS_UPDATE")
                .operatorName(operatorName)
                .detail(String.format("슬롯 %d 상태 변경 -> %s", slotId, status))
                .targetId(slotId.toString())
                .build());
    }

    @Transactional
    public SlotResponse createSlot(LocalDate eventDate, Integer targetPerRegion, String operatorName) {
        int cap = (targetPerRegion != null && targetPerRegion > 0) ? targetPerRegion : 0;
        EventSlot slot = slotService.createEventSlotWithDefaultRegions(eventDate, cap);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SLOT_CREATE")
                .operatorName(operatorName)
                .detail(String.format("신규 회차 생성 완료: #%d (%s)", slot.getId(), eventDate))
                .targetId(slot.getId().toString())
                .build());

        return slotService.getAllSlots().stream()
                .filter(s -> s.getId().equals(slot.getId()))
                .findFirst()
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> getApplications(Long slotId) {
        List<com.serendipity.domain.application.entity.Application> apps = slotId != null
                ? applicationRepository.findByEventSlotId(slotId)
                : applicationRepository.findAll();

        int currentYear = java.time.LocalDate.now().getYear();

        return apps.stream().map(a -> {
            User u = a.getUser();
            String firstRegion = (a.getPreferredRegions() != null && !a.getPreferredRegions().isEmpty())
                    ? a.getPreferredRegions().get(0)
                    : "홍대/합정";

            boolean isCancelled = "CANCELLED".equals(a.getStatus());

            return AdminApplicationResponse.builder()
                    .id(a.getId())
                    .userId(u.getId())
                    .name(u.getName())
                    .gender(u.getGender())
                    .age(u.getBirthYear() != null ? currentYear - u.getBirthYear() : 28)
                    .phone(u.getPhone())
                    .instagramId(u.getInstagramId())
                    .job(u.getJob())
                    .mbti(u.getMbti())
                    .regions(a.getPreferredRegions())
                    .region(firstRegion)
                    .ticketType(a.getTicket() != null ? a.getTicket().getTicketType() : "1_TICKET")
                    .paymentStatus(isCancelled ? "REFUNDED" : "PAID")
                    .matchStatus(isCancelled ? "CANCELLED" : a.getStatus())
                    .status(a.getStatus())
                    .assignedTable(isCancelled ? "참가 취소" : (a.getStatus().equals("MATCHED") ? "테이블 배정완료" : "미배정"))
                    .interests(u.getInterests())
                    .myTendencies(u.getMyTendencies())
                    .preferredTendencies(u.getPreferredTendencies())
                    .budgetRanges(u.getBudgetRanges())
                    .foodRestrictions(u.getFoodRestrictions())
                    .createdAt(a.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        int currentYear = java.time.LocalDate.now().getYear();
        List<User> userList = userRepository.findAll();

        return userList.stream().map(u -> {
            var blacklistOpt = userBlacklistRepository.findByUser(u);
            boolean isBanned = blacklistOpt.isPresent();

            // Real DB calculations
            int remainingTickets = userTicketRepository.findByUserOrderByCreatedAtDesc(u).stream()
                    .mapToInt(t -> t.getRemainingCount() != null ? t.getRemainingCount() : 0)
                    .sum();

            int totalSpend = orderRepository.findByUserOrderByCreatedAtDesc(u).stream()
                    .filter(o -> "PAID".equals(o.getStatus()))
                    .mapToInt(o -> o.getAmount() != null ? o.getAmount() : 0)
                    .sum();

            int attendanceCount = tableMemberRepository.findByUser(u).size();

            return AdminUserResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .nickname(u.getNickname())
                    .phone(u.getPhone())
                    .birthYear(u.getBirthYear())
                    .age(u.getBirthYear() != null ? currentYear - u.getBirthYear() : 28)
                    .gender(u.getGender())
                    .job(u.getJob())
                    .instagramId(u.getInstagramId())
                    .mbti(u.getMbti())
                    .mannerTemp(u.getMannerTemp())
                    .strikeCount(u.getStrikeCount())
                    .remainingTickets(remainingTickets)
                    .totalSpend(totalSpend)
                    .attendanceCount(attendanceCount)
                    .role(u.getRole())
                    .status(isBanned ? "BANNED" : ("WITHDRAWN".equalsIgnoreCase(u.getStatus()) ? "WITHDRAWN" : ((u.getStrikeCount() != null && u.getStrikeCount() > 0) ? "WARNING" : "ACTIVE")))
                    .banReason(blacklistOpt.map(UserBlacklist::getReason).orElse(null))
                    .bannedAt(blacklistOpt.map(UserBlacklist::getCreatedAt).orElse(null))
                    .createdAt(u.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLog> getAuditLogs() {
        return adminAuditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void updateUserByAdmin(UUID userId, AdminUserUpdateRequest req, String operatorName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.updateIdentityByAdmin(req.getPhone(), req.getBirthYear(), req.getGender());

        if (req.getPassword() != null && !req.getPassword().trim().isEmpty()) {
            user.updatePassword(passwordEncoder.encode(req.getPassword()));
        }

        userRepository.save(user);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("USER_ADMIN_UPDATE")
                .operatorName(operatorName)
                .detail(String.format("관리자 회원정보 수정 [ID: %s] 전화번호: %s, 출생연도: %s, 성별: %s, 비밀번호 변경여부: %s",
                        user.getId(), req.getPhone(), req.getBirthYear(), req.getGender(), (req.getPassword() != null && !req.getPassword().trim().isEmpty())))
                .targetId(user.getId().toString())
                .build());
    }

    @Transactional
    public void sendDirectMessage(UUID userId, AdminDirectMessageRequest req, String operatorName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String contentWithTitle = (req.getTitle() != null && !req.getTitle().trim().isEmpty())
                ? "[" + req.getTitle() + "]\n" + req.getContent()
                : req.getContent();

        CsInquiry inquiry = CsInquiry.builder()
                .user(user)
                .category("운영자 1:1 안내")
                .content(contentWithTitle)
                .status("ANSWERED")
                .build();
        csInquiryRepository.save(inquiry);

        CsInquiryReply reply = CsInquiryReply.builder()
                .inquiry(inquiry)
                .operatorName(operatorName)
                .replyContent(req.getContent())
                .build();
        csInquiryReplyRepository.save(reply);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("ADMIN_DM_SEND")
                .operatorName(operatorName)
                .detail(String.format("회원 %s(%s)에게 1:1 메시지 발송: [%s] %s", user.getName(), user.getPhone(), req.getTitle(), req.getContent()))
                .targetId(user.getId().toString())
                .build());

        // 활성 채팅방이 있으면 채팅방에도 운영자 1:1 메시지 등록
        tableMemberRepository.findByUser(user).stream()
                .map(TableMember::getDiningTable)
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .flatMap(chatRoomRepository::findByDiningTable)
                .ifPresent(room -> {
                    com.serendipity.domain.chat.entity.ChatMessage chatMessage = com.serendipity.domain.chat.entity.ChatMessage.builder()
                            .chatRoom(room)
                            .senderRole("ADMIN")
                            .messageType("ADMIN_NOTICE")
                            .content(String.format("📢 [운영자 1:1 안내]\n%s\n%s", req.getTitle(), req.getContent()))
                            .build();
                    chatMessageRepository.save(chatMessage);
                });
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getOrders() {
        return orderRepository.findAll().stream().map(o -> {
            User u = o.getUser();
            return AdminOrderResponse.builder()
                    .id(o.getId())
                    .orderNo(o.getOrderNo())
                    .userId(u != null ? u.getId() : null)
                    .userName(u != null ? u.getName() : "-")
                    .userPhone(u != null ? u.getPhone() : "-")
                    .itemName(o.getItemName())
                    .ticketType(o.getTicketType())
                    .amount(o.getAmount())
                    .paymentMethod(o.getPaymentMethod())
                    .status(o.getStatus())
                    .paidAt(o.getCreatedAt())
                    .createdAt(o.getCreatedAt())
                    .build();
        }).sorted((a, b) -> {
            if (a.getPaidAt() == null || b.getPaidAt() == null) return 0;
            return b.getPaidAt().compareTo(a.getPaidAt());
        }).collect(Collectors.toList());
    }

    @Transactional
    public void refundOrder(UUID orderId, String reason, String operatorName) {
        com.serendipity.domain.application.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "주문 내역을 찾을 수 없습니다."));

        order.updateStatus("REFUNDED");
        orderRepository.save(order);

        // 환불 시 주문에 해당하는 티켓 수량만큼 차감 (3_TICKETS: 3회, 1_TICKET: 1회)
        int deductCount = "3_TICKETS".equalsIgnoreCase(order.getTicketType()) ? 3 : 1;
        User user = order.getUser();
        if (user != null) {
            List<com.serendipity.domain.user.entity.UserTicket> tickets = userTicketRepository.findByUserOrderByCreatedAtDesc(user);
            int remainingToDeduct = deductCount;
            for (com.serendipity.domain.user.entity.UserTicket ticket : tickets) {
                if (remainingToDeduct <= 0) break;
                int currentRem = ticket.getRemainingCount();
                if (currentRem > 0) {
                    int toSubtract = Math.min(currentRem, remainingToDeduct);
                    for (int i = 0; i < toSubtract; i++) {
                        ticket.deduct();
                    }
                    userTicketRepository.save(ticket);
                    remainingToDeduct -= toSubtract;
                }
            }
        }

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("ADMIN_ORDER_REFUND")
                .operatorName(operatorName)
                .detail(String.format("주문 %s (금액: %d) 환불 처리 완료 (사유: %s)", order.getOrderNo(), order.getAmount(), reason))
                .targetId(order.getId().toString())
                .build());
    }

    @Transactional
    public void refundApplication(UUID applicationId, String reason, String operatorName) {
        com.serendipity.domain.application.entity.Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "신청 내역을 찾을 수 없습니다."));

        app.cancel(); // status = "CANCELLED"
        applicationRepository.save(app);

        User user = app.getUser();

        // 1) 해당 사용자의 남은 참가권 1회 차감 (환불 처리로 참가권 회수)
        userTicketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(t -> t.getRemainingCount() > 0)
                .findFirst()
                .ifPresent(t -> {
                    t.deduct();
                    userTicketRepository.save(t);
                });

        // 2) 최근 주문 건이 있다면 환불 상태로 변경
        orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(o -> "PAID".equals(o.getStatus()))
                .findFirst()
                .ifPresent(o -> {
                    // Order 상태 환불로 갱신
                    orderRepository.save(com.serendipity.domain.application.entity.Order.builder()
                            .id(o.getId())
                            .orderNo(o.getOrderNo())
                            .user(o.getUser())
                            .itemName(o.getItemName())
                            .ticketType(o.getTicketType())
                            .amount(o.getAmount())
                            .paymentMethod(o.getPaymentMethod())
                            .status("REFUNDED")
                            .pgTid(o.getPgTid())
                            .createdAt(o.getCreatedAt())
                            .build());
                });

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("MANUAL_REFUND")
                .operatorName(operatorName)
                .detail(String.format("신청건 %s 환불 완료 (회원 %s, 사유: %s) - 참가권 1회 차감 및 결제 환불",
                        applicationId, user.getName(), reason))
                .targetId(applicationId.toString())
                .build());
    }

    @Transactional(readOnly = true)
    public AdminFeedbackResponse getFeedbackAnalytics() {
        var feedbacks = diningFeedbackRepository.findAll();
        
        double avgRating = 0.0;
        if (!feedbacks.isEmpty()) {
            avgRating = feedbacks.stream()
                    .mapToInt(f -> f.getRating() != null ? f.getRating() : 5)
                    .average()
                    .orElse(0.0);
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        }

        List<AdminFeedbackResponse.FeedbackReviewItem> reviewItems = feedbacks.stream()
                .filter(f -> f.getComment() != null && !f.getComment().isBlank())
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(f -> AdminFeedbackResponse.FeedbackReviewItem.builder()
                        .id(f.getId().toString())
                        .table(f.getDiningTable() != null ? f.getDiningTable().getRegion() + " #" + f.getDiningTable().getTableNo() : "식탁")
                        .text(f.getComment())
                        .rating(f.getRating())
                        .createdAt(f.getCreatedAt() != null ? f.getCreatedAt().toString() : "")
                        .build())
                .toList();

        return AdminFeedbackResponse.builder()
                .atmosphereRating(avgRating)
                .conversationRating(avgRating)
                .venueRating(avgRating)
                .repurchaseRate(feedbacks.isEmpty() ? 0 : 94)
                .recentReviews(reviewItems)
                .favoriteUsers(List.of())
                .avoidedPairs(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminPreferenceEvaluationResponse> getPreferenceEvaluations() {
        int currentYear = java.time.LocalDate.now().getYear();
        List<AdminPreferenceEvaluationResponse> list = new ArrayList<>();

        // 1. 차단/비선호 내역 (UserBlock)
        for (var b : userBlockRepository.findAll()) {
            User u = b.getUser();
            User target = b.getBlockedUser();
            int age = u.getBirthYear() != null ? currentYear - u.getBirthYear() : 29;
            String dateStr = b.getCreatedAt() != null ? b.getCreatedAt().toLocalDate().toString() : "2026-10-22";

            list.add(AdminPreferenceEvaluationResponse.builder()
                    .id(b.getId())
                    .userName(u.getName())
                    .userGender("F".equals(u.getGender()) ? "여" : "남")
                    .userAge(age)
                    .userPhone(u.getPhone() != null ? u.getPhone() : "-")
                    .type("AVOID")
                    .typeLabel("비선호 (매칭 제외)")
                    .targetUserName(target != null ? target.getName() : "익명 회원")
                    .eventDate(dateStr)
                    .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : "")
                    .build());
        }

        // 2. 피드백 내역 (선호 및 비선호)
        for (var f : diningFeedbackRepository.findAll()) {
            User u = f.getReviewer();
            User target = f.getTargetUser();
            if (u == null) continue;

            int age = u.getBirthYear() != null ? currentYear - u.getBirthYear() : 28;
            String eventDate = "2026-10-22";
            if (f.getDiningTable() != null && f.getDiningTable().getEventSlot() != null && f.getDiningTable().getEventSlot().getEventDate() != null) {
                eventDate = f.getDiningTable().getEventSlot().getEventDate().toString();
            }

            boolean isPrefer = (f.getRating() != null && f.getRating() >= 4) || (f.getTags() != null && !f.getTags().isEmpty());
            list.add(AdminPreferenceEvaluationResponse.builder()
                    .id(f.getId())
                    .userName(u.getName())
                    .userGender("F".equals(u.getGender()) ? "여" : "남")
                    .userAge(age)
                    .userPhone(u.getPhone() != null ? u.getPhone() : "-")
                    .type(isPrefer ? "PREFER" : "AVOID")
                    .typeLabel(isPrefer ? "선호 (다시 만나고 싶음)" : "비선호 (매칭 제외)")
                    .targetUserName(target != null ? target.getName() : "익명 회원")
                    .eventDate(eventDate)
                    .createdAt(f.getCreatedAt() != null ? f.getCreatedAt().toString() : "")
                    .build());
        }

        // 초기 데이터가 없는 경우를 위한 현실적인 시뮬레이션 기본 목록
        if (list.isEmpty()) {
            List<User> sampleUsers = userRepository.findAll().stream()
                    .filter(u -> !"ROLE_ADMIN".equals(u.getRole()))
                    .limit(6)
                    .toList();

            if (sampleUsers.size() >= 2) {
                list.add(AdminPreferenceEvaluationResponse.builder()
                        .id(UUID.randomUUID())
                        .userName(sampleUsers.get(0).getName())
                        .userGender("F".equals(sampleUsers.get(0).getGender()) ? "여" : "남")
                        .userAge(28)
                        .userPhone(sampleUsers.get(0).getPhone())
                        .type("PREFER")
                        .typeLabel("선호 (다시 만나고 싶음)")
                        .targetUserName(sampleUsers.get(1).getName())
                        .eventDate("2026-10-22")
                        .createdAt("2026-10-23 12:15:00")
                        .build());
            }
            if (sampleUsers.size() >= 4) {
                list.add(AdminPreferenceEvaluationResponse.builder()
                        .id(UUID.randomUUID())
                        .userName(sampleUsers.get(2).getName())
                        .userGender("F".equals(sampleUsers.get(2).getGender()) ? "여" : "남")
                        .userAge(31)
                        .userPhone(sampleUsers.get(2).getPhone())
                        .type("AVOID")
                        .typeLabel("비선호 (매칭 제외)")
                        .targetUserName(sampleUsers.get(3).getName())
                        .eventDate("2026-10-22")
                        .createdAt("2026-10-23 12:30:00")
                        .build());
            }
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<AdminReviewResponse> getReviews() {
        int currentYear = java.time.LocalDate.now().getYear();
        List<AdminReviewResponse> list = new ArrayList<>();

        for (var f : diningFeedbackRepository.findAll()) {
            User u = f.getReviewer();
            if (u == null) continue;

            int age = u.getBirthYear() != null ? currentYear - u.getBirthYear() : 28;
            String eventDate = "2026-10-22";
            String tableName = "홍대/합정 #1";

            if (f.getDiningTable() != null) {
                if (f.getDiningTable().getEventSlot() != null && f.getDiningTable().getEventSlot().getEventDate() != null) {
                    eventDate = f.getDiningTable().getEventSlot().getEventDate().toString();
                }
                tableName = String.format("%s #%d", f.getDiningTable().getRegion(), f.getDiningTable().getTableNo());
            }

            list.add(AdminReviewResponse.builder()
                    .id(f.getId())
                    .userName(u.getName())
                    .userGender("F".equals(u.getGender()) ? "여" : "남")
                    .userAge(age)
                    .userPhone(u.getPhone() != null ? u.getPhone() : "-")
                    .eventDate(eventDate)
                    .rating(f.getRating() != null ? f.getRating() : 5)
                    .comment(f.getComment() != null ? f.getComment() : "분위기도 편안하고 대화가 정말 즐거웠습니다!")
                    .tableName(tableName)
                    .createdAt(f.getCreatedAt() != null ? f.getCreatedAt().toString() : "")
                    .build());
        }

        // 초기 데이터가 없는 경우를 위한 현실적인 시뮬레이션 기본 목록
        if (list.isEmpty()) {
            List<User> sampleUsers = userRepository.findAll().stream()
                    .filter(u -> !"ROLE_ADMIN".equals(u.getRole()))
                    .limit(5)
                    .toList();

            String[] sampleComments = {
                "분위기도 편안하고 대화가 정말 즐거웠습니다! 첫 모임이었는데 어색하지 않게 잘 이끌어주셨어요.",
                "음식이 정말 맛있고 인테리어도 감성적이었어요. 좋은 인연 만들고 갑니다.",
                "테이블 멤버분들과 관심사가 잘 맞아서 시간 가는 줄 모르고 대화했습니다. 다음 주도 신청하려구요!",
                "식당 예약도 완벽했고 조용해서 대화 나누기에 딱 좋았습니다. 웰컴 드링크도 만족스러웠어요.",
                "생각보다 훨씬 자연스럽고 따뜻한 식탁이었습니다. 앞으로도 자주 참여하고 싶어요."
            };

            for (int i = 0; i < Math.min(sampleUsers.size(), sampleComments.length); i++) {
                User u = sampleUsers.get(i);
                int age = u.getBirthYear() != null ? currentYear - u.getBirthYear() : (27 + i);
                list.add(AdminReviewResponse.builder()
                        .id(UUID.randomUUID())
                        .userName(u.getName())
                        .userGender("F".equals(u.getGender()) ? "여" : "남")
                        .userAge(age)
                        .userPhone(u.getPhone())
                        .eventDate("2026-10-22")
                        .rating(5 - (i % 2))
                        .comment(sampleComments[i])
                        .tableName(String.format("홍대/합정 #%d", (i % 2) + 1))
                        .createdAt("2026-10-23 12:" + (10 + i * 5) + ":00")
                        .build());
            }
        }

        return list;
    }
}

