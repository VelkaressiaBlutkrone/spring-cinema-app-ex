package com.cinema.application.loadtest;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.member.dto.AccessTokenResponse;
import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.service.MemberService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 부하 테스트 전용 인증 API (Step 20)
 *
 * - Profile "loadtest" 활성화 시에만 노출
 * - JMeter 등 부하 테스트 도구에서 Hybrid Encryption 없이 로그인하여 JWT 획득
 * - 운영 환경에서는 이 프로파일을 활성화하지 않음
 */
@Slf4j
@RestController
@RequestMapping("/api/loadtest")
@Profile("loadtest")
@RequiredArgsConstructor
public class LoadTestAuthController {

    private final MemberService memberService;

    /**
     * 부하 테스트용 단순 로그인 (평문 JSON)
     * - 요청: { "loginId": "user1", "password": "password123" }
     * - 응답: { "accessToken": "eyJ..." }
     */
    @PostMapping("/login")
    public ResponseEntity<AccessTokenResponse> login(@Valid @RequestBody PlainLoginRequest request) {
        MemberRequest.Login login = new MemberRequest.Login();
        login.setLoginId(request.loginId);
        login.setPassword(request.password);
        TokenResponse tokens = memberService.login(login);
        return ResponseEntity.ok(new AccessTokenResponse(tokens.getAccessToken()));
    }

    public record PlainLoginRequest(
            @NotBlank String loginId,
            @NotBlank String password
    ) {}
}
