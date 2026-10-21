package com.serendipity.domain.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminCsReplyRequest {

    private String operatorName;

    private String replyContent;

    private String answer;

    public String getEffectiveReplyContent() {
        if (replyContent != null && !replyContent.trim().isEmpty()) {
            return replyContent.trim();
        }
        return (answer != null) ? answer.trim() : "";
    }

    public String getEffectiveOperatorName() {
        return (operatorName != null && !operatorName.trim().isEmpty()) ? operatorName.trim() : "총괄관리자";
    }
}
