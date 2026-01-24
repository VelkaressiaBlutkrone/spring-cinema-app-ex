package com.cinema.domain.member.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.jwt.JwtTokenProvider;
import com.cinema.global.jwt.RefreshTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 회원 서비스
 *
 * RULE:
 * - Access Token 유효시간 ≤ 15분 (설정값 사용)
 * - Refresh Token은 Redis에 저장
 * - JWT Token 전체 값이 로그에 기록되지 않음 (일부만 마스킹)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${jwt.access-token-expire-time}")
    private long accessTokenExpireTime;

    @Value("${jwt.refresh-token-expire-time}")
    private long refreshTokenExpireTime;

    @Transactional
    public Long signup(MemberRequest.SignUp request) {
        if (memberRepository.findByLoginId(request.getLoginId()).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        Member member = Member.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordEncoder.encode(request.getPassword())) // 비밀번호 암호화
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();

        log.info("회원 가입 완료: loginId={}", request.getLoginId());
        return memberRepository.save(member).getId();
    }

    @Transactional(readOnly = true)
    public TokenResponse login(MemberRequest.Login request) {
        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND, "아이디 또는 비밀번호가 일치하지 않습니다."));

        if (!member.isActive()) {
            throw new BusinessException(ErrorCode.MEMBER_DISABLED);
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD, "아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 토큰 발급 (Access: 설정값, Refresh: 설정값)
        String accessToken = jwtTokenProvider.createToken(
                member.getLoginId(),
                member.getRole().name(),
                accessTokenExpireTime);
        String refreshToken = jwtTokenProvider.createToken(
                member.getLoginId(),
                member.getRole().name(),
                refreshTokenExpireTime);

        // Refresh Token은 Redis에 저장
        refreshTokenService.saveRefreshToken(member.getLoginId(), refreshToken);

        log.info("로그인 성공: loginId={}, role={}", member.getLoginId(), member.getRole());
        log.debug("Access Token 발급: {}", jwtTokenProvider.maskToken(accessToken));
        log.debug("Refresh Token 발급: {}", jwtTokenProvider.maskToken(refreshToken));

        return new TokenResponse(accessToken, refreshToken);
    }

    /**
     * 토큰 갱신
     *
     * @param refreshToken Refresh Token
     * @return 새로운 Access Token과 Refresh Token
     */
    @Transactional(readOnly = true)
    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String loginId = jwtTokenProvider.getSubject(refreshToken);

        // Redis에서 Refresh Token 검증
        if (!refreshTokenService.validateRefreshToken(loginId, refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (!member.isActive()) {
            throw new BusinessException(ErrorCode.MEMBER_DISABLED);
        }

        // 새로운 토큰 발급
        String newAccessToken = jwtTokenProvider.createToken(
                member.getLoginId(),
                member.getRole().name(),
                accessTokenExpireTime);
        String newRefreshToken = jwtTokenProvider.createToken(
                member.getLoginId(),
                member.getRole().name(),
                refreshTokenExpireTime);

        // 새로운 Refresh Token을 Redis에 저장 (기존 토큰 교체)
        refreshTokenService.saveRefreshToken(member.getLoginId(), newRefreshToken);

        log.info("토큰 갱신 성공: loginId={}", loginId);
        log.debug("새 Access Token 발급: {}", jwtTokenProvider.maskToken(newAccessToken));
        log.debug("새 Refresh Token 발급: {}", jwtTokenProvider.maskToken(newRefreshToken));

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    /**
     * 로그아웃
     *
     * @param loginId 로그인 ID
     */
    public void logout(String loginId) {
        refreshTokenService.deleteRefreshToken(loginId);
        log.info("로그아웃 완료: loginId={}", loginId);
    }
}
