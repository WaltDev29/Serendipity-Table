package com.serendipity.domain.dining.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecretChemistryResponse {

    private boolean isMutual;
    private UUID targetUserId;
    private String targetNickname;
    private String targetPhone; // 쌍방 매칭 시에만 공개!
    private String message;
}
