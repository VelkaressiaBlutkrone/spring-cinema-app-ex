package com.cinema.global.jwt;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Refresh Token 관리 서비스
 *
 * RULE:
 * - Refresh Token은 Redis에 저장
 * - Key: refresh:token:{loginId}
 * - Value: refreshToken
 * - TTL: refresh-token-expire-time (7일)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${jwt.refresh-token-expire-time}")
    private long refreshTokenExpireTime;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:token:";

    /**
     * Refresh Token 저장
     *
     * @param loginId      로그인 ID
     * @param refreshToken Refresh Token
     */
    public void saveRefreshToken(String loginId, String refreshToken) {
        String key = REFRESH_TOKEN_PREFIX + loginId;
        redisTemplate.opsForValue().set(key, refreshToken, refreshTokenExpireTime, TimeUnit.MILLISECONDS);
        log.debug("Refresh Token 저장 완료: loginId={}, key={}", loginId, key);
    }

    /**
     * Refresh Token 조회
     *
     * @param loginId 로그인 ID
     * @return Refresh Token (없으면 null)
     */
    public String getRefreshToken(String loginId) {
        String key = REFRESH_TOKEN_PREFIX + loginId;
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Refresh Token 삭제 (로그아웃)
     *
     * @param loginId 로그인 ID
     */
    public void deleteRefreshToken(String loginId) {
        String key = REFRESH_TOKEN_PREFIX + loginId;
        redisTemplate.delete(key);
        log.debug("Refresh Token 삭제 완료: loginId={}, key={}", loginId, key);
    }

    /**
     * Refresh Token 존재 여부 확인
     *
     * @param loginId      로그인 ID
     * @param refreshToken Refresh Token
     * @return 일치 여부
     */
    public boolean validateRefreshToken(String loginId, String refreshToken) {
        String storedToken = getRefreshToken(loginId);
        return storedToken != null && storedToken.equals(refreshToken);
    }
}
