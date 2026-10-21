package com.serendipity.domain.dining.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SecretChemistryRequest {

    @NotNull(message = "호감 있는 상대방 ID를 선택해주세요.")
    private UUID targetUserId;
}
