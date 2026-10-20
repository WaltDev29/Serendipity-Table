package com.serendipity.domain.application.controller;

import com.serendipity.domain.application.dto.ApplicationRequest;
import com.serendipity.domain.application.dto.ApplicationResponse;
import com.serendipity.domain.application.service.ApplicationService;
import com.serendipity.global.common.ApiResponse;
import com.serendipity.global.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.apply(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("식탁 모임 신청이 완료되었습니다.", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ApplicationResponse> applications = applicationService.getMyApplications(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(applications));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        applicationService.cancelApplication(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("신청이 취소되었으며 참가권이 반환되었습니다.", null));
    }
}
