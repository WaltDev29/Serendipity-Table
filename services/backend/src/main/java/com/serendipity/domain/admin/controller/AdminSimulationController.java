package com.serendipity.domain.admin.controller;

import com.serendipity.domain.admin.service.AdminSimulationService;
import com.serendipity.global.common.ApiResponse;
import com.serendipity.global.security.UserPrincipal;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/simulation")
@RequiredArgsConstructor
public class AdminSimulationController {

    private final AdminSimulationService simulationService;

    @Data
    public static class SimulationActionRequest {
        private String action; // GRANT_TICKET, REVOKE_TICKET, APPLY_SLOT, CANCEL_APPLICATION, CANCEL_AFTER_MATCH
        private List<UUID> userIds;
    }

    @PostMapping("/action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> executeAction(
            @RequestBody SimulationActionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String operator = principal != null ? principal.getUsername() : "관리자";
        Map<String, Object> result;

        switch (request.getAction().toUpperCase()) {
            case "GRANT_TICKET":
                result = simulationService.grantTickets(request.getUserIds(), operator);
                break;
            case "REVOKE_TICKET":
                result = simulationService.revokeTickets(request.getUserIds(), operator);
                break;
            case "APPLY_SLOT":
                result = simulationService.applyNearestSlot(request.getUserIds(), operator);
                break;
            case "CANCEL_APPLICATION":
                result = simulationService.cancelApplications(request.getUserIds(), operator);
                break;
            case "CANCEL_AFTER_MATCH":
                result = simulationService.cancelAfterMatch(request.getUserIds(), operator);
                break;
            default:
                throw new IllegalArgumentException("지원되지 않는 시뮬레이션 액션입니다: " + request.getAction());
        }

        return ResponseEntity.ok(ApiResponse.ok("시뮬레이션 액션 (" + request.getAction() + ") 이 완료되었습니다.", result));
    }
}
