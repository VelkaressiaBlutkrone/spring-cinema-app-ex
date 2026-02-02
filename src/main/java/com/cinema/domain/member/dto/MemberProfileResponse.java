package com.cinema.domain.member.dto;

import com.cinema.domain.member.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 프로필 조회 응답 (비밀번호 제외)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberProfileResponse {

    private String loginId;
    private String name;
    private String email;
    private String phone;

    public static MemberProfileResponse from(Member member) {
        return MemberProfileResponse.builder()
                .loginId(member.getLoginId())
                .name(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .build();
    }
}
