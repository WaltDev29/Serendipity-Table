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

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<AdminApplicationResponse>>> getApplications(@RequestParam(required = false) Long slotId) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getApplications(slotId)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUsers()));
    }

    @PatchMapping("/slots/{slotId}/regions/toggle-close")
    public ResponseEntity<ApiResponse<Void>> toggleRegionClosed(
            @PathVariable Long slotId,
            @RequestParam String region,
            @RequestParam boolean isClosed,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.toggleRegionClosed(slotId, region, isClosed, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("권역 마감 상태가 변경되었습니다.", null));
    }

    @PostMapping("/slots")
    public ResponseEntity<ApiResponse<SlotResponse>> createSlot(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate eventDate,
            @RequestParam(required = false, defaultValue = "48") Integer targetCapacity,
            @AuthenticationPrincipal UserPrincipal principal) {
        SlotResponse created = adminService.createSlot(eventDate, targetCapacity, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("신규 회차가 등록되었습니다.", created));
    }

    @PatchMapping("/slots/{slotId}/status")
    public ResponseEntity<ApiResponse<Void>> updateSlotStatus(
            @PathVariable Long slotId,
            @RequestParam String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.updateSlotStatus(slotId, status, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("슬롯 상태가 변경되었습니다.", null));
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

    @PostMapping("/users/{userId}/strike")
    public ResponseEntity<ApiResponse<Void>> addStrike(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "운영 수칙 위반") String reason,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.addStrike(userId, reason, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("주의 1회가 부여되었습니다.", null));
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

    @PostMapping("/cs/inquiries/{inquiryId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveInquiry(
            @PathVariable UUID inquiryId,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.resolveInquiry(inquiryId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("문의가 해결 처리되었습니다.", null));
    }

    @DeleteMapping("/cs/inquiries/{inquiryId}")
    public ResponseEntity<ApiResponse<Void>> deleteInquiry(
            @PathVariable UUID inquiryId,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteInquiry(inquiryId, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("문의가 삭제되었습니다.", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AdminAuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAuditLogs()));
    }

    @PatchMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> updateUser(
            @PathVariable UUID userId,
            @RequestBody AdminUserUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.updateUserByAdmin(userId, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("회원 정보가 성공적으로 수정되었습니다.", null));
    }

    @PostMapping("/users/{userId}/message")
    public ResponseEntity<ApiResponse<Void>> sendDirectMessage(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminDirectMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.sendDirectMessage(userId, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("1:1 메시지가 성공적으로 전송되었습니다.", null));
    }

    @PostMapping("/applications/{applicationId}/refund")
    public ResponseEntity<ApiResponse<Void>> refundApplication(
            @PathVariable UUID applicationId,
            @RequestBody(required = false) AdminRefundRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String reason = request != null && request.getReason() != null ? request.getReason() : "관리자 수동 환불";
        adminService.refundApplication(applicationId, reason, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("환불 및 참가권 차감 처리가 완료되었습니다.", null));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<AdminOrderResponse>>> getOrders() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getOrders()));
    }

    @PostMapping("/orders/{orderId}/refund")
    public ResponseEntity<ApiResponse<Void>> refundOrder(
            @PathVariable UUID orderId,
            @RequestBody(required = false) AdminRefundRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String reason = request != null && request.getReason() != null ? request.getReason() : "관리자 수동 주문 환불";
        adminService.refundOrder(orderId, reason, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("주문 환불 처리가 완료되었습니다.", null));
    }

    @GetMapping("/analytics/feedback")
    public ResponseEntity<ApiResponse<AdminFeedbackResponse>> getFeedbackAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getFeedbackAnalytics()));
    }

    @GetMapping("/analytics/preferences")
    public ResponseEntity<ApiResponse<List<AdminPreferenceEvaluationResponse>>> getPreferenceEvaluations() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPreferenceEvaluations()));
    }

    @GetMapping("/analytics/reviews")
    public ResponseEntity<ApiResponse<List<AdminReviewResponse>>> getReviews() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getReviews()));
    }
}

