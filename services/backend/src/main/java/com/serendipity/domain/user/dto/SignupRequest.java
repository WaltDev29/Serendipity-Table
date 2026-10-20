package com.serendipity.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message = "전화번호는 필수입니다.")
    private String phone;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    @NotNull(message = "출생연도는 필수입니다.")
    private Integer birthYear;

    @NotBlank(message = "성별은 필수입니다.")
    private String gender; // M or F

    @NotBlank(message = "직업은 필수입니다.")
    private String job;

    private String instagramId;
    private String mbti;

    private List<String> interests;
    private List<String> myTendencies;
    private List<String> preferredTendencies;
    private List<String> budgetRanges;
    private String foodRestrictions;
}
