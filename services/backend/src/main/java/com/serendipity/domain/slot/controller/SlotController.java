package com.serendipity.domain.slot.controller;

import com.serendipity.domain.slot.dto.SlotResponse;
import com.serendipity.domain.slot.service.SlotService;
import com.serendipity.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getUpcomingSlots() {
        List<SlotResponse> slots = slotService.getUpcomingSlots();
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }
}
