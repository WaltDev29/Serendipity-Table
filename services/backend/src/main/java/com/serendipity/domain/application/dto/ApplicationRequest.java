package com.serendipity.domain.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ApplicationRequest {

    @NotNull(message = "신청할 회차 슬롯 ID는 필수입니다.")
    private Long eventSlotId;

    @NotEmpty(message = "희망 권역을 1개 이상 선택해주세요.")
    private List<String> preferredRegions;
}
