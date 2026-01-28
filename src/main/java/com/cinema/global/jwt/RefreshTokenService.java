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
 * - Redis 연결 실패 시 로그만 출력 (서버 계속 실행)
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
        
        try {
            redisTemplate.opsForValue().set(key, refreshToken, refreshTokenExpireTime, TimeUnit.MILLISECONDS);
            log.debug("Refresh Token 저장 완료: loginId={}, key={}", loginId, key);
        } catch (Exception e) {
            log.error("[Redis] Refresh Token 저장 실패 - loginId={}, error={}", loginId, e.getMessage());
        }
    }

    /**
     * Refresh Token 조회
     *
     * @param loginId 로그인 ID
     * @return Refresh Token (없거나 Redis 실패 시 null)
     */
    public String getRefreshToken(String loginId) {
        String key = REFRESH_TOKEN_PREFIX + loginId;
        
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.warn("[Redis] Refresh Token 조회 실패 - loginId={}, error={}", loginId, e.getMessage());
            return null;
        }
    }

    /**
     * Refresh Token 삭제 (로그아웃)
     *
     * @param loginId 로그인 ID
     */
    public void deleteRefreshToken(String loginId) {
        String key = REFRESH_TOKEN_PREFIX + loginId;
        
        try {
            redisTemplate.delete(key);
            log.debug("Refresh Token 삭제 완료: loginId={}, key={}", loginId, key);
        } catch (Exception e) {
            log.warn("[Redis] Refresh Token 삭제 실패 - loginId={}, error={}", loginId, e.getMessage());
        }
    }

    /**
     * Refresh Token 존재 여부 확인
     *
     * @param loginId      로그인 ID
     * @param refreshToken Refresh Token
     * @return 일치 여부 (Redis 실패 시 false)
     */
    public boolean validateRefreshToken(String loginId, String refreshToken) {
        String storedToken = getRefreshToken(loginId);
        return storedToken != null && storedToken.equals(refreshToken);
    }
}
