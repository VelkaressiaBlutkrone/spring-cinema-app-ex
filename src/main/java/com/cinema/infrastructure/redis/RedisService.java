package com.cinema.infrastructure.redis;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis 서비스
 * 
 * RULE 7: Redis 사용 규칙
 * - Key 네이밍 규칙 준수
 * - TTL 설정 필수
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;
    private final Gson gson;

    // Key Prefix
    private static final String SEAT_HOLD_PREFIX = "seat:hold:";
    private static final String SEAT_STATUS_PREFIX = "seat:status:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:token:";

    // ========================================
    // 좌석 HOLD 관련
    // ========================================

    /**
     * 좌석 HOLD 저장
     * Key: seat:hold:{screeningId}:{seatId}
     * 
     * @param screeningId 상영 ID
     * @param seatId 좌석 ID
     * @param memberId 회원 ID
     * @param ttlMinutes TTL (분)
     * @return HOLD Token
     */
    public String saveHold(Long screeningId, Long seatId, Long memberId, long ttlMinutes) {
        String key = createHoldKey(screeningId, seatId);
        String holdToken = generateHoldToken();
        
        HoldInfo holdInfo = new HoldInfo(holdToken, memberId, System.currentTimeMillis());
        String value = gson.toJson(holdInfo);
        
        redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(ttlMinutes));
        
        log.info("[Redis] HOLD 저장 - screeningId={}, seatId={}, memberId={}, ttl={}분", 
                screeningId, seatId, memberId, ttlMinutes);
        
        return holdToken;
    }

    /**
     * HOLD 정보 조회
     */
    public Optional<HoldInfo> getHold(Long screeningId, Long seatId) {
        String key = createHoldKey(screeningId, seatId);
        String value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            return Optional.empty();
        }
        
        return Optional.of(gson.fromJson(value, HoldInfo.class));
    }

    /**
     * HOLD Token 검증
     */
    public boolean validateHoldToken(Long screeningId, Long seatId, String holdToken) {
        return getHold(screeningId, seatId)
                .map(info -> info.holdToken().equals(holdToken))
                .orElse(false);
    }

    /**
     * HOLD 삭제
     */
    public void deleteHold(Long screeningId, Long seatId) {
        String key = createHoldKey(screeningId, seatId);
        Boolean deleted = redisTemplate.delete(key);
        
        if (Boolean.TRUE.equals(deleted)) {
            log.info("[Redis] HOLD 삭제 - screeningId={}, seatId={}", screeningId, seatId);
        }
    }

    /**
     * HOLD TTL 조회 (남은 시간, 초)
     */
    public Long getHoldTtl(Long screeningId, Long seatId) {
        String key = createHoldKey(screeningId, seatId);
        return redisTemplate.getExpire(key);
    }

    // ========================================
    // Refresh Token 관련
    // ========================================

    /**
     * Refresh Token 저장
     */
    public void saveRefreshToken(Long memberId, String refreshToken, long ttlMillis) {
        String key = createRefreshTokenKey(memberId);
        redisTemplate.opsForValue().set(key, refreshToken, Duration.ofMillis(ttlMillis));
        log.debug("[Redis] Refresh Token 저장 - memberId={}", memberId);
    }

    /**
     * Refresh Token 조회
     */
    public Optional<String> getRefreshToken(Long memberId) {
        String key = createRefreshTokenKey(memberId);
        return Optional.ofNullable(redisTemplate.opsForValue().get(key));
    }

    /**
     * Refresh Token 삭제 (로그아웃)
     */
    public void deleteRefreshToken(Long memberId) {
        String key = createRefreshTokenKey(memberId);
        redisTemplate.delete(key);
        log.debug("[Redis] Refresh Token 삭제 - memberId={}", memberId);
    }

    // ========================================
    // 좌석 상태 캐시 관련
    // ========================================

    /**
     * 좌석 상태 캐시 저장
     * Key: seat:status:{screeningId}
     */
    public void saveSeatStatus(Long screeningId, Object seatStatusData, long ttlMinutes) {
        String key = createSeatStatusKey(screeningId);
        String value = gson.toJson(seatStatusData);
        redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(ttlMinutes));
    }

    /**
     * 좌석 상태 캐시 조회
     */
    public <T> Optional<T> getSeatStatus(Long screeningId, Class<T> clazz) {
        String key = createSeatStatusKey(screeningId);
        String value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            return Optional.empty();
        }
        
        return Optional.of(gson.fromJson(value, clazz));
    }

    /**
     * 좌석 상태 캐시 삭제 (무효화)
     */
    public void invalidateSeatStatus(Long screeningId) {
        String key = createSeatStatusKey(screeningId);
        redisTemplate.delete(key);
    }

    // ========================================
    // Helper Methods
    // ========================================

    private String createHoldKey(Long screeningId, Long seatId) {
        return SEAT_HOLD_PREFIX + screeningId + ":" + seatId;
    }

    private String createSeatStatusKey(Long screeningId) {
        return SEAT_STATUS_PREFIX + screeningId;
    }

    private String createRefreshTokenKey(Long memberId) {
        return REFRESH_TOKEN_PREFIX + memberId;
    }

    private String generateHoldToken() {
        return UUID.randomUUID().toString();
    }

    // ========================================
    // Inner Classes
    // ========================================

    /**
     * HOLD 정보 레코드
     */
    public record HoldInfo(
            String holdToken,
            Long memberId,
            Long holdAt
    ) {}
}
