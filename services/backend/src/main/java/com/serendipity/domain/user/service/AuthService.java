package com.serendipity.domain.user.service;

import com.serendipity.domain.user.dto.AuthResponse;
import com.serendipity.domain.user.dto.LoginRequest;
import com.serendipity.domain.user.dto.SignupRequest;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserTicket;
import com.serendipity.domain.user.repository.UserBlacklistRepository;
import com.serendipity.domain.user.repository.UserRepository;
import com.serendipity.domain.user.repository.UserTicketRepository;
import com.serendipity.global.exception.CustomException;
import com.serendipity.global.exception.ErrorCode;
import com.serendipity.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserTicketRepository userTicketRepository;
    private final UserBlacklistRepository userBlacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new CustomException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = User.builder()
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .nickname(req.getNickname())
                .birthYear(req.getBirthYear())
                .gender(req.getGender().toUpperCase())
                .job(req.getJob())
                .instagramId(req.getInstagramId())
                .mbti(req.getMbti())
                .interests(req.getInterests() != null ? req.getInterests() : new ArrayList<>())
                .myTendencies(req.getMyTendencies() != null ? req.getMyTendencies() : new ArrayList<>())
                .preferredTendencies(req.getPreferredTendencies() != null ? req.getPreferredTendencies() : new ArrayList<>())
                .budgetRanges(req.getBudgetRanges() != null ? req.getBudgetRanges() : new ArrayList<>())
                .foodRestrictions(req.getFoodRestrictions())
                .mannerTemp(new BigDecimal("36.5"))
                .strikeCount(0)
                .role("ROLE_USER")
                .build();

        userRepository.save(user);

        // 신규 가입 웰컴 1회 참가권 지급 (유효기간 없음)
        UserTicket welcomeTicket = UserTicket.builder()
                .user(user)
                .ticketType("WELCOME_1")
                .totalCount(1)
                .remainingCount(1)
                .build();
        userTicketRepository.save(welcomeTicket);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getPhone(), user.getRole());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .phone(user.getPhone())
                .name(user.getName())
                .nickname(user.getNickname())
                .role(user.getRole())
                .mannerTemp(user.getMannerTemp())
                .ticketCount(1)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        if ("WITHDRAWN".equalsIgnoreCase(user.getStatus())) {
            throw new CustomException(ErrorCode.USER_WITHDRAWN);
        }

        if (userBlacklistRepository.existsByUser(user)) {
            throw new CustomException(ErrorCode.USER_BLACKLISTED);
        }

        int remainingTickets = userTicketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .mapToInt(UserTicket::getRemainingCount)
                .sum();

        String token = jwtTokenProvider.generateToken(user.getId(), user.getPhone(), user.getRole());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .phone(user.getPhone())
                .name(user.getName())
                .nickname(user.getNickname())
                .role(user.getRole())
                .mannerTemp(user.getMannerTemp())
                .ticketCount(remainingTickets)
                .build();
    }
}
