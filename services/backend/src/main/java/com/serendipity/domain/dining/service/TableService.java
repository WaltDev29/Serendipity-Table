package com.serendipity.domain.dining.service;

import com.serendipity.domain.chat.entity.ChatRoom;
import com.serendipity.domain.chat.repository.ChatRoomRepository;
import com.serendipity.domain.dining.dto.*;
import com.serendipity.domain.dining.entity.DiningFeedback;
import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.dining.entity.SecretChemistry;
import com.serendipity.domain.dining.entity.TableMember;
import com.serendipity.domain.dining.repository.DiningFeedbackRepository;
import com.serendipity.domain.dining.repository.DiningTableRepository;
import com.serendipity.domain.dining.repository.SecretChemistryRepository;
import com.serendipity.domain.dining.repository.TableMemberRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final DiningTableRepository diningTableRepository;
    private final TableMemberRepository tableMemberRepository;
    private final DiningFeedbackRepository diningFeedbackRepository;
    private final SecretChemistryRepository secretChemistryRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ActiveTableResponse getActiveTable(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<TableMember> memberships = tableMemberRepository.findByUserOrderByEventDateDesc(user);

        if (memberships.isEmpty()) {
            return null;
        }

        // 가장 최근 또는 오늘 이후의 테이블
        TableMember currentMembership = memberships.stream()
                .filter(m -> !m.getDiningTable().getEventSlot().getEventDate().isBefore(LocalDate.now().minusDays(1)))
                .findFirst()
                .orElse(memberships.get(0));

        DiningTable table = currentMembership.getDiningTable();
        List<TableMember> allMembers = tableMemberRepository.findByDiningTable(table);
        Optional<ChatRoom> chatRoom = chatRoomRepository.findByDiningTable(table);

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

        var memberInfos = allMembers.stream().map(m -> ActiveTableResponse.MemberInfo.builder()
                .userId(m.getUser().getId())
                .nickname(m.getUser().getNickname())
                .birthYear(m.getUser().getBirthYear())
                .gender(m.getUser().getGender())
                .job(m.getUser().getJob())
                .mbti(m.getUser().getMbti())
                .role(m.getRole())
                .mannerTemp(m.getUser().getMannerTemp())
                .build()
        ).collect(Collectors.toList());

        return ActiveTableResponse.builder()
                .tableId(table.getId())
                .eventSlotId(table.getEventSlot().getId())
                .tableNo(table.getTableNo())
                .region(table.getRegion())
                .eventDate(table.getEventSlot().getEventDate())
                .eventTime(table.getEventSlot().getEventTime())
                .harmonyScore(table.getHarmonyScore())
                .status(table.getStatus())
                .chatRoomId(chatRoom.map(ChatRoom::getId).orElse(null))
                .venue(venueInfo)
                .members(memberInfos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PastTableResponse> getPastTables(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<TableMember> memberships = tableMemberRepository.findByUserOrderByEventDateDesc(user);

        return memberships.stream()
                .filter(m -> m.getDiningTable().getEventSlot().getEventDate().isBefore(LocalDate.now()))
                .map(m -> {
                    DiningTable table = m.getDiningTable();
                    List<TableMember> members = tableMemberRepository.findByDiningTable(table);
                    List<String> nicknames = members.stream()
                            .map(tm -> tm.getUser().getNickname())
                            .collect(Collectors.toList());

                    boolean hasFeedback = !diningFeedbackRepository
                            .findByDiningTableAndReviewer(table, user).isEmpty();

                    return PastTableResponse.builder()
                            .tableId(table.getId())
                            .eventDate(table.getEventSlot().getEventDate())
                            .region(table.getRegion())
                            .venueName(table.getVenue() != null ? table.getVenue().getName() : "식당 조율 중")
                            .venueImageUrl(table.getVenue() != null ? table.getVenue().getImageUrl() : null)
                            .memberNicknames(nicknames)
                            .feedbackSubmitted(hasFeedback)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void submitFeedback(UUID reviewerId, UUID tableId, DiningFeedbackRequest req) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        User targetUser = userRepository.findById(req.getTargetUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        DiningTable table = diningTableRepository.findById(tableId)
                .orElseThrow(() -> new CustomException(ErrorCode.TABLE_NOT_FOUND));

        DiningFeedback feedback = DiningFeedback.builder()
                .diningTable(table)
                .reviewer(reviewer)
                .targetUser(targetUser)
                .rating(req.getRating())
                .tags(req.getTags() != null ? req.getTags() : new ArrayList<>())
                .comment(req.getComment())
                .build();

        diningFeedbackRepository.save(feedback);

        // 매너온도 반영
        BigDecimal delta;
        switch (req.getRating()) {
            case 5: delta = new BigDecimal("0.2"); break;
            case 4: delta = new BigDecimal("0.1"); break;
            case 3: delta = BigDecimal.ZERO; break;
            case 2: delta = new BigDecimal("-0.2"); break;
            default: delta = new BigDecimal("-0.5"); break;
        }
        targetUser.updateMannerTemp(delta);
    }

    @Transactional
    public SecretChemistryResponse submitSecretChemistry(UUID senderId, UUID tableId, SecretChemistryRequest req) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        User target = userRepository.findById(req.getTargetUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        DiningTable table = diningTableRepository.findById(tableId)
                .orElseThrow(() -> new CustomException(ErrorCode.TABLE_NOT_FOUND));

        SecretChemistry chemistry = secretChemistryRepository
                .findByDiningTableAndSender(table, sender)
                .orElseGet(() -> SecretChemistry.builder()
                        .diningTable(table)
                        .sender(sender)
                        .target(target)
                        .isMutual(false)
                        .build());

        // 상대방도 나를 선택했는지 확인
        Optional<SecretChemistry> reverseMatch = secretChemistryRepository
                .findByDiningTableAndSenderAndTarget(table, target, sender);

        boolean isMutual = false;
        if (reverseMatch.isPresent()) {
            isMutual = true;
            chemistry.setMutual(true);
            reverseMatch.get().setMutual(true);
        }

        secretChemistryRepository.save(chemistry);

        return SecretChemistryResponse.builder()
                .isMutual(isMutual)
                .targetUserId(target.getId())
                .targetNickname(target.getNickname())
                .targetPhone(isMutual ? target.getPhone() : null)
                .message(isMutual ? "축하합니다! 서로 호감이 통해 연락처가 교환되었습니다." : "호감이 성공적으로 전송되었습니다.")
                .build();
    }
}
