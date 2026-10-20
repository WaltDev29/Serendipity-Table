package com.serendipity.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {

    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phone;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}
