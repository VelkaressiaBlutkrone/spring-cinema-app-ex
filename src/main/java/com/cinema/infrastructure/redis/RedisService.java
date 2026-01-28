package com.cinema.infrastructure.redis;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

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
 * - Redis 연결 실패 시 예외를 던지지 않고 로그만 출력 (서버 계속 실행)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;
    private final Gson gson;
    
    /** Redis 연결 가용 여부 (런타임에 동적으로 확인) */
    private volatile boolean redisAvailable = true;

    /** Redis 미연결 시 로컬(인메모리) HOLD 폴백 (개발/로컬 용도) */
    private final Map<String, LocalHold> localHolds = new ConcurrentHashMap<>();

    // Key Prefix
    private static final String SEAT_HOLD_PREFIX = "seat:hold:";
    private static final String SEAT_STATUS_PREFIX = "seat:status:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:token:";

    // ========================================
    // 좌석 HOLD 관련
    // ========================================

    /**
     * Redis 연결 가용 여부 확인
     */
    public boolean isAvailable() {
        return redisAvailable;
    }

    /**
     * 좌석 HOLD 저장
     * Key: seat:hold:{screeningId}:{seatId}
     *
     * @param screeningId 상영 ID
     * @param seatId      좌석 ID
     * @param memberId    회원 ID
     * @param ttlMinutes  TTL (분)
     * @return HOLD Token (Redis 실패 시 null)
     */
    public String saveHold(Long screeningId, Long seatId, Long memberId, long ttlMinutes) {
        String key = createHoldKey(screeningId, seatId);
        String holdToken = generateHoldToken();

        HoldInfo holdInfo = new HoldInfo(holdToken, memberId, System.currentTimeMillis());
        String value = gson.toJson(holdInfo);

        try {
            redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(ttlMinutes));
            redisAvailable = true;

            log.info("[Redis] HOLD 저장 - screeningId={}, seatId={}, memberId={}, ttl={}분",
                    screeningId, seatId, memberId, ttlMinutes);

            return holdToken;
        } catch (Exception e) {
            redisAvailable = false;
            log.error("[Redis] HOLD 저장 실패 - screeningId={}, seatId={}, error={}",
                    screeningId, seatId, e.getMessage());
            // Redis 장애 시 로컬 폴백 저장 (TTL 포함)
            long expireAtMillis = System.currentTimeMillis() + Duration.ofMinutes(ttlMinutes).toMillis();
            localHolds.put(key, new LocalHold(holdInfo, expireAtMillis));
            log.warn("[Redis] (LOCAL) HOLD 저장 폴백 - screeningId={}, seatId={}, memberId={}, ttl={}분",
                    screeningId, seatId, memberId, ttlMinutes);
            return holdToken;
        }
    }

    /**
     * HOLD 정보 조회
     */
    public Optional<HoldInfo> getHold(Long screeningId, Long seatId) {
        String key = createHoldKey(screeningId, seatId);
        
        try {
            String value = redisTemplate.opsForValue().get(key);
            redisAvailable = true;

            if (value == null) {
                return Optional.empty();
            }

            return Optional.of(gson.fromJson(value, HoldInfo.class));
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] HOLD 조회 실패 - screeningId={}, seatId={}, error={}",
                    screeningId, seatId, e.getMessage());
            return getLocalHold(key);
        }
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
        
        try {
            Boolean deleted = redisTemplate.delete(key);
            redisAvailable = true;

            if (Boolean.TRUE.equals(deleted)) {
                log.info("[Redis] HOLD 삭제 - screeningId={}, seatId={}", screeningId, seatId);
            }
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] HOLD 삭제 실패 - screeningId={}, seatId={}, error={}",
                    screeningId, seatId, e.getMessage());
            localHolds.remove(key);
        }
    }

    /**
     * HOLD TTL 조회 (남은 시간, 초)
     */
    public Long getHoldTtl(Long screeningId, Long seatId) {
        String key = createHoldKey(screeningId, seatId);
        
        try {
            Long ttl = redisTemplate.getExpire(key);
            redisAvailable = true;
            return ttl;
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] HOLD TTL 조회 실패 - screeningId={}, seatId={}, error={}",
                    screeningId, seatId, e.getMessage());
            return getLocalHoldTtlSeconds(key);
        }
    }

    // ========================================
    // Refresh Token 관련
    // ========================================

    /**
     * Refresh Token 저장
     */
    public void saveRefreshToken(Long memberId, String refreshToken, long ttlMillis) {
        String key = createRefreshTokenKey(memberId);
        
        try {
            redisTemplate.opsForValue().set(key, refreshToken, Duration.ofMillis(ttlMillis));
            redisAvailable = true;
            log.debug("[Redis] Refresh Token 저장 - memberId={}", memberId);
        } catch (Exception e) {
            redisAvailable = false;
            log.error("[Redis] Refresh Token 저장 실패 - memberId={}, error={}", memberId, e.getMessage());
        }
    }

    /**
     * Refresh Token 조회
     */
    public Optional<String> getRefreshToken(Long memberId) {
        String key = createRefreshTokenKey(memberId);
        
        try {
            String token = redisTemplate.opsForValue().get(key);
            redisAvailable = true;
            return Optional.ofNullable(token);
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] Refresh Token 조회 실패 - memberId={}, error={}", memberId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Refresh Token 삭제 (로그아웃)
     */
    public void deleteRefreshToken(Long memberId) {
        String key = createRefreshTokenKey(memberId);
        
        try {
            redisTemplate.delete(key);
            redisAvailable = true;
            log.debug("[Redis] Refresh Token 삭제 - memberId={}", memberId);
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] Refresh Token 삭제 실패 - memberId={}, error={}", memberId, e.getMessage());
        }
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
        
        try {
            redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(ttlMinutes));
            redisAvailable = true;
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] 좌석 상태 캐시 저장 실패 - screeningId={}, error={}", screeningId, e.getMessage());
        }
    }

    /**
     * 좌석 상태 캐시 조회
     */
    public <T> Optional<T> getSeatStatus(Long screeningId, Class<T> clazz) {
        String key = createSeatStatusKey(screeningId);
        
        try {
            String value = redisTemplate.opsForValue().get(key);
            redisAvailable = true;

            if (value == null) {
                return Optional.empty();
            }

            return Optional.of(gson.fromJson(value, clazz));
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] 좌석 상태 캐시 조회 실패 - screeningId={}, error={}", screeningId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 좌석 상태 캐시 삭제 (무효화)
     */
    public void invalidateSeatStatus(Long screeningId) {
        String key = createSeatStatusKey(screeningId);
        
        try {
            redisTemplate.delete(key);
            redisAvailable = true;
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("[Redis] 좌석 상태 캐시 삭제 실패 - screeningId={}, error={}", screeningId, e.getMessage());
        }
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

    private Optional<HoldInfo> getLocalHold(String key) {
        LocalHold local = localHolds.get(key);
        if (local == null) return Optional.empty();
        if (System.currentTimeMillis() > local.expireAtMillis) {
            localHolds.remove(key);
            return Optional.empty();
        }
        return Optional.of(local.info);
    }

    private Long getLocalHoldTtlSeconds(String key) {
        LocalHold local = localHolds.get(key);
        if (local == null) return -1L;
        long remainMillis = local.expireAtMillis - System.currentTimeMillis();
        if (remainMillis <= 0) {
            localHolds.remove(key);
            return -1L;
        }
        return Math.max(0L, remainMillis / 1000);
    }

    private record LocalHold(HoldInfo info, long expireAtMillis) {}

    /**
     * HOLD 정보 레코드
     */
    public record HoldInfo(
            String holdToken,
            Long memberId,
            Long holdAt) {
    }
}
