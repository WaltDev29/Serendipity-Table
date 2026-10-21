package com.serendipity.domain.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminUserUpdateRequest {
    private String phone;
    private String password;
    private Integer birthYear;
    private String gender;
}
