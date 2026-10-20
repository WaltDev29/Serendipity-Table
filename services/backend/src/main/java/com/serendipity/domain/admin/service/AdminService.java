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
public class AdminService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final DiningTableRepository diningTableRepository;
    private final TableMemberRepository tableMemberRepository;
    private final VenueRepository venueRepository;
    private final CsInquiryRepository csInquiryRepository;
    private final CsInquiryReplyRepository csInquiryReplyRepository;
    private final UserBlacklistRepository userBlacklistRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;
    private final EventSlotRepository eventSlotRepository;
    private final RegionSlotRepository regionSlotRepository;
    private final SlotService slotService;
    private final CsService csService;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long currentApps = applicationRepository.count();
        long activeTables = diningTableRepository.count();
        long totalVenues = venueRepository.count();
        long pendingCs = csInquiryRepository.findAll().stream()
                .filter(i -> "PENDING".equals(i.getStatus()))
                .count();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .currentApplications(currentApps)
                .activeTables(activeTables)
                .totalVenues(totalVenues)
                .pendingInquiries(pendingCs)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getSlots() {
        return slotService.getUpcomingSlots();
    }

    @Transactional
    public void toggleRegionClosed(Long slotId, String region, boolean isClosed, String operatorName) {
        RegionSlotId id = new RegionSlotId(slotId, region);
        RegionSlot slot = regionSlotRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "권역 슬롯을 찾을 수 없습니다."));

        slot.toggleClosed(isClosed);

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("SLOT_TOGGLE_CLOSE")
                .operatorName(operatorName)
                .detail(String.format("슬롯 %d 권역 %s 마감 상태 변경 -> %s", slotId, region, isClosed))
                .targetId(slotId.toString())
                .build());
    }

    @Transactional(readOnly = true)
    public List<ActiveTableResponse> getTables(Long slotId) {
        List<DiningTable> tables = slotId != null 
                ? diningTableRepository.findByEventSlotId(slotId)
                : diningTableRepository.findAll();

        return tables.stream().map(table -> {
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

            return ActiveTableResponse.builder()
                    .tableId(table.getId())
                    .eventSlotId(table.getEventSlot().getId())
                    .tableNo(table.getTableNo())
                    .region(table.getRegion())
                    .eventDate(table.getEventSlot().getEventDate())
                    .eventTime(table.getEventSlot().getEventTime())
                    .harmonyScore(table.getHarmonyScore())
                    .status(table.getStatus())
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

        CsInquiryReply reply = CsInquiryReply.builder()
                .inquiry(inquiry)
                .operatorName(req.getOperatorName() != null ? req.getOperatorName() : operatorName)
                .replyContent(req.getReplyContent())
                .build();

        csInquiryReplyRepository.save(reply);
        inquiry.markAsAnswered();

        adminAuditLogRepository.save(AdminAuditLog.builder()
                .actionType("CS_REPLY")
                .operatorName(operatorName)
                .detail(String.format("CS 문의 %s 답변 완료", inquiryId))
                .targetId(inquiryId.toString())
                .build());
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLog> getAuditLogs() {
        return adminAuditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
