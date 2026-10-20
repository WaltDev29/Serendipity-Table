package com.serendipity.domain.cs.service;

import com.serendipity.domain.cs.dto.CsInquiryRequest;
import com.serendipity.domain.cs.dto.CsInquiryResponse;
import com.serendipity.domain.cs.entity.CsInquiry;
import com.serendipity.domain.cs.repository.CsInquiryReplyRepository;
import com.serendipity.domain.cs.repository.CsInquiryRepository;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.repository.UserRepository;
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
public class CsService {

    private final CsInquiryRepository csInquiryRepository;
    private final CsInquiryReplyRepository csInquiryReplyRepository;
    private final UserRepository userRepository;

    @Transactional
    public CsInquiryResponse createInquiry(UUID userId, CsInquiryRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        CsInquiry inquiry = CsInquiry.builder()
                .user(user)
                .category(req.getCategory())
                .content(req.getContent())
                .status("PENDING")
                .build();

        csInquiryRepository.save(inquiry);

        return toResponse(inquiry);
    }

    @Transactional(readOnly = true)
    public List<CsInquiryResponse> getMyInquiries(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return csInquiryRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CsInquiryResponse toResponse(CsInquiry inq) {
        var replyInfos = csInquiryReplyRepository.findByInquiryOrderByCreatedAtAsc(inq).stream()
                .map(r -> CsInquiryResponse.ReplyInfo.builder()
                        .id(r.getId())
                        .operatorName(r.getOperatorName())
                        .replyContent(r.getReplyContent())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return CsInquiryResponse.builder()
                .id(inq.getId())
                .category(inq.getCategory())
                .content(inq.getContent())
                .status(inq.getStatus())
                .createdAt(inq.getCreatedAt())
                .replies(replyInfos)
                .build();
    }
}
