package com.serendipity.domain.user.service;

import com.serendipity.domain.user.dto.*;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserBlock;
import com.serendipity.domain.user.entity.UserTicket;
import com.serendipity.domain.user.repository.UserBlockRepository;
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
public class UserService {

    private final UserRepository userRepository;
    private final UserTicketRepository userTicketRepository;
    private final UserBlockRepository userBlockRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        int ticketCount = userTicketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .mapToInt(UserTicket::getRemainingCount)
                .sum();

        return UserProfileResponse.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .name(user.getName())
                .nickname(user.getNickname())
                .birthYear(user.getBirthYear())
                .gender(user.getGender())
                .job(user.getJob())
                .instagramId(user.getInstagramId())
                .mbti(user.getMbti())
                .interests(user.getInterests())
                .myTendencies(user.getMyTendencies())
                .preferredTendencies(user.getPreferredTendencies())
                .budgetRanges(user.getBudgetRanges())
                .foodRestrictions(user.getFoodRestrictions())
                .mannerTemp(user.getMannerTemp())
                .strikeCount(user.getStrikeCount())
                .role(user.getRole())
                .ticketCount(ticketCount)
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.updateProfile(
                req.getNickname(),
                req.getJob(),
                req.getInstagramId(),
                req.getMbti(),
                req.getInterests(),
                req.getMyTendencies(),
                req.getPreferredTendencies(),
                req.getBudgetRanges(),
                req.getFoodRestrictions()
        );

        return getMyProfile(userId);
    }

    @Transactional(readOnly = true)
    public List<UserTicketResponse> getMyTickets(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return userTicketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(t -> UserTicketResponse.builder()
                        .id(t.getId())
                        .ticketType(t.getTicketType())
                        .totalCount(t.getTotalCount())
                        .remainingCount(t.getRemainingCount())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserBlockResponse> getMyBlocks(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return userBlockRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(b -> UserBlockResponse.builder()
                        .id(b.getId())
                        .blockedUserId(b.getBlockedUser().getId())
                        .blockedUserNickname(b.getBlockedUser().getNickname())
                        .reason(b.getReason())
                        .createdAt(b.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void blockUser(UUID userId, UserBlockRequest req) {
        if (userId.equals(req.getTargetUserId())) {
            throw new CustomException(ErrorCode.CANNOT_BLOCK_SELF);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        User targetUser = userRepository.findById(req.getTargetUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (userBlockRepository.existsByUserAndBlockedUser(user, targetUser)) {
            throw new CustomException(ErrorCode.ALREADY_BLOCKED);
        }

        UserBlock block = UserBlock.builder()
                .user(user)
                .blockedUser(targetUser)
                .reason(req.getReason())
                .build();

        userBlockRepository.save(block);
    }

    @Transactional
    public void unblockUser(UUID userId, UUID targetUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        UserBlock block = userBlockRepository.findByUserAndBlockedUser(user, targetUser)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "차단 내역이 존재하지 않습니다."));

        userBlockRepository.delete(block);
    }
}
