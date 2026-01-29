package com.cinema.domain.member.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class MemberRequest {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class SignUp {
        private String loginId;
        private String password;
        private String name;
        private String phone;
        private String email;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Login {
        private String loginId;
        private String password;
    }

    @Getter
    @NoArgsConstructor
    public static class RefreshToken {
        private String refreshToken;
    }
}
