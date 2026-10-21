package com.serendipity.domain.dining.controller;

import com.serendipity.domain.dining.dto.*;
import com.serendipity.domain.dining.service.TableService;
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
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping("/my-active")
    public ResponseEntity<ApiResponse<ActiveTableResponse>> getMyActiveTable(
            @AuthenticationPrincipal UserPrincipal principal) {
        ActiveTableResponse response = tableService.getActiveTable(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/my-past")
    public ResponseEntity<ApiResponse<List<PastTableResponse>>> getMyPastTables(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PastTableResponse> responses = tableService.getPastTables(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @PostMapping("/{tableId}/feedback")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID tableId,
            @Valid @RequestBody DiningFeedbackRequest request) {
        tableService.submitFeedback(principal.getId(), tableId, request);
        return ResponseEntity.ok(ApiResponse.ok("피드백이 성공적으로 등록되었습니다.", null));
    }

    @PostMapping("/{tableId}/secret-chemistry")
    public ResponseEntity<ApiResponse<SecretChemistryResponse>> submitSecretChemistry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID tableId,
            @Valid @RequestBody SecretChemistryRequest request) {
        SecretChemistryResponse response = tableService.submitSecretChemistry(principal.getId(), tableId, request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }
}
