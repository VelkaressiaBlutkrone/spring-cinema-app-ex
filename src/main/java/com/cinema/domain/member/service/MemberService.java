package com.cinema.domain.member.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.member.dto.MemberProfileResponse;
import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.jwt.JwtTokenProvider;
import com.cinema.global.jwt.RefreshTokenService;
import com.cinema.global.security.LoginBruteForceService;

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
    private final LoginBruteForceService bruteForceService;

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
        bruteForceService.checkLocked(request.getLoginId());

        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> {
                    bruteForceService.recordFailure(request.getLoginId());
                    return new BusinessException(ErrorCode.MEMBER_NOT_FOUND, "아이디 또는 비밀번호가 일치하지 않습니다.");
                });

        if (!member.isActive()) {
            throw new BusinessException(ErrorCode.MEMBER_DISABLED);
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
            bruteForceService.recordFailure(request.getLoginId());
            throw new BusinessException(ErrorCode.INVALID_PASSWORD, "아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        bruteForceService.clearSuccess(request.getLoginId());

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

    /**
     * 본인 프로필 조회
     *
     * @param loginId 로그인 ID (인증 주체)
     * @return 프로필 응답 (loginId, name, email, phone)
     */
    @Transactional(readOnly = true)
    public MemberProfileResponse getMyProfile(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        if (!member.isActive()) {
            throw new BusinessException(ErrorCode.MEMBER_DISABLED);
        }
        return MemberProfileResponse.from(member);
    }

    /**
     * 본인 정보 수정 (비밀번호, 이름, 이메일, 연락처)
     * 전달된 필드만 반영; 비밀번호는 평문 전달 시 BCrypt 인코딩 후 저장.
     *
     * @param loginId 로그인 ID (인증 주체)
     * @param request 수정 요청 (password, name, email, phone 모두 선택)
     */
    @Transactional
    public void updateMyProfile(String loginId, MemberRequest.UpdateProfile request) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        if (!member.isActive()) {
            throw new BusinessException(ErrorCode.MEMBER_DISABLED);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            member.updatePassword(passwordEncoder.encode(request.getPassword()));
        }

        String name = request.getName() != null ? request.getName() : member.getName();
        String email = request.getEmail() != null ? request.getEmail() : member.getEmail();
        String phone = request.getPhone() != null ? request.getPhone() : member.getPhone();

        if (!email.equals(member.getEmail()) && memberRepository.findByEmail(email).isPresent()) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        member.updateInfo(name, phone, email);
        log.info("회원 정보 수정 완료: loginId={}", loginId);
    }
}
