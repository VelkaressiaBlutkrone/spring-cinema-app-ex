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

    /**
     * 본인 정보 수정 (PATCH /api/members/me)
     * - password: 선택. 있으면 BCrypt로 변경.
     * - name, email, phone: 선택. 전달된 필드만 수정.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class UpdateProfile {
        private String password;
        private String name;
        private String email;
        private String phone;
    }
}
