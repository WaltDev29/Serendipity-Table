package com.serendipity.domain.cs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CsInquiryRequest {

    @NotBlank(message = "문의 카테고리를 선택해주세요.")
    private String category;

    @NotBlank(message = "문의 내용을 입력해주세요.")
    private String content;
}
