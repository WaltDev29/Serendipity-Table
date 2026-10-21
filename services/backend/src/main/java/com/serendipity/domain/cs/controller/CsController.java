package com.serendipity.domain.cs.controller;

import com.serendipity.domain.cs.dto.CsInquiryRequest;
import com.serendipity.domain.cs.dto.CsInquiryResponse;
import com.serendipity.domain.cs.service.CsService;
import com.serendipity.global.common.ApiResponse;
import com.serendipity.global.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cs/inquiries")
@RequiredArgsConstructor
public class CsController {

    private final CsService csService;

    @PostMapping
    public ResponseEntity<ApiResponse<CsInquiryResponse>> createInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CsInquiryRequest request) {
        CsInquiryResponse response = csService.createInquiry(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("문의가 접수되었습니다.", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CsInquiryResponse>>> getMyInquiries(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CsInquiryResponse> inquiries = csService.getMyInquiries(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(inquiries));
    }
}
