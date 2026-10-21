package com.serendipity.domain.matching.controller;

import com.serendipity.domain.matching.service.MatchingLifecycleService;
import com.serendipity.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/matching/lifecycle")
@RequiredArgsConstructor
public class MatchingLifecycleController {

    private final MatchingLifecycleService lifecycleService;

    @PostMapping("/step/{step}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerStep(
            @PathVariable String step,
            @RequestParam(required = false) Long slotId) {

        Map<String, Object> result;
        switch (step.toLowerCase()) {
            case "monday-noon":
            case "1":
                result = lifecycleService.runMondayNoonMatching(slotId);
                break;
            case "monday-night":
            case "2":
                result = lifecycleService.runMondayNightRematch(slotId);
                break;
            case "tuesday-morning":
            case "3":
                result = lifecycleService.runTuesdayMorningRematch(slotId);
                break;
            case "tuesday-noon":
            case "4":
                result = lifecycleService.runTuesdayNoonFinalConfirmation(slotId);
                break;
            case "tuesday-16":
            case "5":
                result = lifecycleService.checkTuesday16UnreservedVenues(slotId);
                break;
            case "event-day-noon":
            case "6":
                result = lifecycleService.sendEventDayNoonReminder(slotId);
                break;
            case "event-day-30m":
            case "7":
                result = lifecycleService.sendEventDay30MinReminder(slotId);
                break;
            case "event-day-start":
            case "8":
                result = lifecycleService.sendEventDayStartNotice(slotId);
                break;
            case "next-day-feedback":
            case "9":
                result = lifecycleService.sendNextDayFeedbackRequest(slotId);
                break;
            case "reset":
            case "10":
                result = lifecycleService.resetMatchingData(slotId);
                break;
            default:
                throw new IllegalArgumentException("지원되지 않는 라이프사이클 단계입니다: " + step);
        }

        return ResponseEntity.ok(ApiResponse.ok("라이프사이클 단계 (" + step + ") 가 성공적으로 실행되었습니다.", result));
    }
}
