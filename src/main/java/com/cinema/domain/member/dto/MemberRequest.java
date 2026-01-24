package com.cinema.domain.member.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

public class MemberRequest {

    @Getter
    @NoArgsConstructor
    public static class SignUp {
        private String loginId;
        private String password;
        private String name;
        private String phone;
        private String email;
    }

    @Getter
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