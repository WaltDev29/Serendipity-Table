package com.serendipity.domain.admin.controller;

import com.serendipity.domain.admin.dto.*;
import com.serendipity.domain.admin.entity.AdminAuditLog;
import com.serendipity.domain.admin.service.AdminService;
import com.serendipity.domain.cs.dto.CsInquiryResponse;
import com.serendipity.domain.dining.dto.ActiveTableResponse;
import com.serendipity.domain.slot.dto.SlotResponse;
import com.serendipity.domain.user.entity.UserBlacklist;
import com.serendipity.domain.venue.entity.Venue;
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
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboard()));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getSlots()));
    }

    @PatchMapping("/slots/{slotId}/regions/{region}/toggle-close")
    public ResponseEntity<ApiResponse<Void>> toggleRegionClosed(
            @PathVariable Long slotId,
            @PathVariable String region,
            @RequestParam boolean isClosed,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.toggleRegionClosed(slotId, region, isClosed, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("권역 마감 상태가 변경되었습니다.", null));
    }

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<ActiveTableResponse>>> getTables(@RequestParam(required = false) Long slotId) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getTables(slotId)));
    }

    @PostMapping("/tables/swap")
    public ResponseEntity<ApiResponse<Void>> swapMembers(
            @Valid @RequestBody AdminMemberSwapRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.swapMembers(request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("멤버 수동 교체가 완료되었습니다.", null));
    }

    @GetMapping("/venues")
    public ResponseEntity<ApiResponse<List<Venue>>> getVenues() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getVenues()));
    }

    @PatchMapping("/venues/{venueId}/reserve")
    public ResponseEntity<ApiResponse<Void>> toggleVenueReserved(
            @PathVariable UUID venueId,
            @RequestParam boolean isReserved,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.toggleVenueReserved(venueId, isReserved, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("식당 예약 상태가 변경되었습니다.", null));
    }

    @GetMapping("/blacklist")
    public ResponseEntity<ApiResponse<List<UserBlacklist>>> getBlacklist() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getBlacklist()));
    }

    @PostMapping("/blacklist")
    public ResponseEntity<ApiResponse<Void>> addToBlacklist(
            @Valid @RequestBody AdminBlacklistRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.addToBlacklist(request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("블랙리스트에 등록되었습니다.", null));
    }

    @DeleteMapping("/blacklist/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeFromBlacklist(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.removeFromBlacklist(userId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("블랙리스트에서 해제되었습니다.", null));
    }

    @GetMapping("/cs/inquiries")
    public ResponseEntity<ApiResponse<List<CsInquiryResponse>>> getInquiries() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getInquiries()));
    }

    @PostMapping("/cs/inquiries/{inquiryId}/reply")
    public ResponseEntity<ApiResponse<Void>> replyInquiry(
            @PathVariable UUID inquiryId,
            @Valid @RequestBody AdminCsReplyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.replyInquiry(inquiryId, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("답변이 등록되었습니다.", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AdminAuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAuditLogs()));
    }
}
