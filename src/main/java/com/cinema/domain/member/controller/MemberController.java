package com.cinema.domain.member.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.cinema.domain.member.dto.AccessTokenResponse;
import com.cinema.domain.member.dto.MemberHoldSummaryResponse;
import com.cinema.domain.member.dto.MemberProfileResponse;
import com.cinema.domain.member.dto.EncryptedPayload;
import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.service.MemberService;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.security.HybridDecryptionService;
import com.cinema.global.security.RefreshTokenCookieHelper;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 회원 컨트롤러
 *
 * RULE:
 * - 로그인/회원가입: EncryptedPayload (RSA+AES-GCM) 필수
 * - Refresh Token: HttpOnly Cookie (SameSite=Strict, Secure in prod)
 * - /api/members/refresh는 인증 불필요 (쿠키로 검증)
 */
@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final HybridDecryptionService hybridDecryption;
    private final RefreshTokenCookieHelper refreshCookie;
    private final Gson gson;

    /**
     * 회원 가입 (EncryptedPayload: loginId, password, name, phone?, email)
     */
    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody EncryptedPayload payload, HttpServletResponse response) {
        MemberRequest.SignUp req = decryptToSignUp(payload);
        return ResponseEntity.ok(memberService.signup(req));
    }

    /**
     * 로그인 (EncryptedPayload: loginId, password)
     * - body: AccessTokenResponse
     * - Set-Cookie: refreshToken (HttpOnly, Secure, SameSite=Strict)
     */
    @PostMapping("/login")
    public ResponseEntity<AccessTokenResponse> login(
            @RequestBody EncryptedPayload payload,
            HttpServletResponse response) {
        MemberRequest.Login req = decryptToLogin(payload);
        TokenResponse tokens = memberService.login(req);
        refreshCookie.setRefreshTokenCookie(tokens.getRefreshToken(), response);
        return ResponseEntity.ok(new AccessTokenResponse(tokens.getAccessToken()));
    }

    /**
     * 토큰 갱신 (Cookie: refreshToken → AccessTokenResponse + Set-Cookie)
     */
    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refresh = refreshCookie.getRefreshTokenFromCookie(request);
        if (refresh == null || refresh.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        TokenResponse tokens = memberService.refreshToken(refresh);
        refreshCookie.setRefreshTokenCookie(tokens.getRefreshToken(), response);
        return ResponseEntity.ok(new AccessTokenResponse(tokens.getAccessToken()));
    }

    /**
     * 로그아웃 (쿠키 삭제 + Redis Refresh 삭제)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication, HttpServletResponse response) {
        String loginId = authentication.getName();
        memberService.logout(loginId);
        refreshCookie.clearRefreshTokenCookie(response);
        return ResponseEntity.ok().build();
    }

    /**
     * 본인 프로필 조회 (인증 필수)
     * 응답: loginId, name, email, phone (비밀번호 제외)
     */
    @GetMapping("/me")
    public ResponseEntity<MemberProfileResponse> getMyProfile(Authentication authentication) {
        String loginId = authentication.getName();
        return ResponseEntity.ok(memberService.getMyProfile(loginId));
    }

    /**
     * 본인 정보 수정 (인증 필수)
     * 요청 본문: password(선택), name(선택), email(선택), phone(선택) — 전달된 필드만 수정
     */
    @PatchMapping("/me")
    public ResponseEntity<Void> updateMyProfile(
            Authentication authentication,
            @RequestBody MemberRequest.UpdateProfile request) {
        String loginId = authentication.getName();
        memberService.updateMyProfile(loginId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 본인 HOLD(장바구니) 목록 조회 (인증 필수)
     * 상영별로 그룹핑, 만료된 HOLD 제외. 좌석별 holdToken으로 결제/해제 API 호출 가능.
     */
    @GetMapping("/me/holds")
    public ResponseEntity<List<MemberHoldSummaryResponse>> getMyHolds(Authentication authentication) {
        String loginId = authentication.getName();
        return ResponseEntity.ok(memberService.getMyHolds(loginId));
    }

    private MemberRequest.Login decryptToLogin(EncryptedPayload p) {
        String plain = hybridDecryption.decrypt(p.getEncryptedKey(), p.getIv(), p.getEncryptedData());
        try {
            return gson.fromJson(plain, MemberRequest.Login.class);
        } catch (JsonSyntaxException e) {
            log.warn("Decrypted login payload parse failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INVALID_INPUT, "잘못된 요청입니다.");
        }
    }

    private MemberRequest.SignUp decryptToSignUp(EncryptedPayload p) {
        String plain = hybridDecryption.decrypt(p.getEncryptedKey(), p.getIv(), p.getEncryptedData());
        try {
            return gson.fromJson(plain, MemberRequest.SignUp.class);
        } catch (JsonSyntaxException e) {
            log.warn("Decrypted signup payload parse failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INVALID_INPUT, "잘못된 요청입니다.");
        }
    }
}
