package com.cinema.domain.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

/**
 * 회원 컨트롤러
 *
 * RULE:
 * - /api/members/signup, /api/members/login은 인증 불필요 (SecurityConfig에서
 * permitAll)
 * - /api/members/refresh, /api/members/logout은 인증 필요
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 회원 가입
     */
    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody MemberRequest.SignUp request) {
        return ResponseEntity.ok(memberService.signup(request));
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody MemberRequest.Login request) {
        return ResponseEntity.ok(memberService.login(request));
    }

    /**
     * 토큰 갱신
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody MemberRequest.RefreshToken request) {
        return ResponseEntity.ok(memberService.refreshToken(request.getRefreshToken()));
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        String loginId = authentication.getName();
        memberService.logout(loginId);
        return ResponseEntity.ok().build();
    }
}
