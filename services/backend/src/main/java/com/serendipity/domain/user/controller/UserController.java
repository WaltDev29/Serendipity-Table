package com.serendipity.domain.user.controller;

import com.serendipity.domain.user.dto.*;
import com.serendipity.domain.user.service.UserService;
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
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse response = userService.getMyProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProfileUpdateRequest request) {
        UserProfileResponse response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("프로필이 수정되었습니다.", response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Void>> withdraw(@AuthenticationPrincipal UserPrincipal principal) {
        userService.withdraw(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("회원 탈퇴 처리가 완료되었습니다.", null));
    }

    @PostMapping(value = "/profile-image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = userService.uploadProfileImage(principal.getId(), file);
        return ResponseEntity.ok(ApiResponse.ok("프로필 사진이 저장되었습니다.", imageUrl));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<UserTicketResponse>>> getMyTickets(@AuthenticationPrincipal UserPrincipal principal) {
        List<UserTicketResponse> tickets = userService.getMyTickets(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    @GetMapping("/blocks")
    public ResponseEntity<ApiResponse<List<UserBlockResponse>>> getMyBlocks(@AuthenticationPrincipal UserPrincipal principal) {
        List<UserBlockResponse> blocks = userService.getMyBlocks(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(blocks));
    }

    @PostMapping("/blocks")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserBlockRequest request) {
        userService.blockUser(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("사용자를 차단하였습니다.", null));
    }

    @DeleteMapping("/blocks/{targetUserId}")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID targetUserId) {
        userService.unblockUser(principal.getId(), targetUserId);
        return ResponseEntity.ok(ApiResponse.ok("차단이 해제되었습니다.", null));
    }
}
