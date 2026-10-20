package com.serendipity.domain.application.controller;

import com.serendipity.domain.application.dto.OrderCheckoutRequest;
import com.serendipity.domain.application.dto.OrderResponse;
import com.serendipity.domain.application.service.OrderService;
import com.serendipity.global.common.ApiResponse;
import com.serendipity.global.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderCheckoutRequest request) {
        OrderResponse response = orderService.checkout(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("결제가 완료되어 참가권이 지급되었습니다.", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<OrderResponse> orders = orderService.getMyOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }
}
