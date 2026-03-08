package com.cinema.domain.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class MemberRequest {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class SignUp {
        @NotBlank(message = "로그인 ID는 필수입니다")
        @Pattern(regexp = "^[a-zA-Z0-9]{4,20}$", message = "로그인 ID는 영문/숫자 4~20자여야 합니다")
        private String loginId;

        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
        private String password;

        @NotBlank(message = "이름은 필수입니다")
        private String name;

        private String phone;

        @Email(message = "이메일 형식이 올바르지 않습니다")
        private String email;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Login {
        @NotBlank(message = "로그인 ID는 필수입니다")
        private String loginId;

        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;
    }

    @Getter
    @NoArgsConstructor
    public static class RefreshToken {
        @NotBlank(message = "Refresh Token은 필수입니다")
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
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
        private String password;

        private String name;

        @Email(message = "이메일 형식이 올바르지 않습니다")
        private String email;

        private String phone;
    }
}
