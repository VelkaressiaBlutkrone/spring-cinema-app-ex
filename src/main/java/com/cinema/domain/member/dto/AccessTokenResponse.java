package com.cinema.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Access Token 전용 응답 (Refresh Token은 HttpOnly 쿠키로 전달)
 */
@Getter
@AllArgsConstructor
public class AccessTokenResponse {

    private String accessToken;
}
