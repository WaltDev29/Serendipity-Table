package com.serendipity.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AdminBlacklistRequest {

    @NotNull(message = "제재 대상 사용자 ID는 필수입니다.")
    private UUID userId;

    @NotBlank(message = "제재 사유는 필수입니다.")
    private String reason;
}
