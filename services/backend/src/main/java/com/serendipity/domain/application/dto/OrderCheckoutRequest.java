package com.serendipity.domain.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderCheckoutRequest {

    @NotBlank(message = "상품명은 필수입니다.")
    private String itemName;

    @NotBlank(message = "참가권 타입은 필수입니다.")
    private String ticketType; // 1_TICKET, 3_TICKETS

    @NotNull(message = "결제 금액은 필수입니다.")
    private Integer amount;

    @NotBlank(message = "결제 수단은 필수입니다.")
    private String paymentMethod; // KAKAO_PAY, TOSS_PAY, CARD
}
