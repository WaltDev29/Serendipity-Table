package com.serendipity.domain.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class UserBlockRequest {

    @NotNull(message = "차단할 대상 사용자 ID는 필수입니다.")
    private UUID targetUserId;

    private String reason;
}
