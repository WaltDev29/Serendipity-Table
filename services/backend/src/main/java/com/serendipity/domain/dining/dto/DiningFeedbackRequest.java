package com.serendipity.domain.dining.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class DiningFeedbackRequest {

    @NotNull(message = "평가 대상 사용자 ID는 필수입니다.")
    private UUID targetUserId;

    @NotNull(message = "별점은 필수입니다.")
    @Min(1)
    @Max(5)
    private Integer rating;

    private List<String> tags;
    private String comment;
}
