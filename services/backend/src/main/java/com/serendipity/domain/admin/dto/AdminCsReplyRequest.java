package com.serendipity.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminCsReplyRequest {

    @NotBlank(message = "답변 작성자명은 필수입니다.")
    private String operatorName;

    @NotBlank(message = "답변 내용은 필수입니다.")
    private String replyContent;
}
