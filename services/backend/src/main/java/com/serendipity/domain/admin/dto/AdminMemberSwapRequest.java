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
public class AdminMemberSwapRequest {

    @NotNull(message = "첫 번째 멤버 ID는 필수입니다.")
    private UUID memberIdA;

    @NotNull(message = "두 번째 멤버 ID는 필수입니다.")
    private UUID memberIdB;

    @NotBlank(message = "교체 사유를 입력해주세요.")
    private String reason;
}
