package com.cinema.infrastructure.redis;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis 기반 Rate Limit (Step 17)
 *
 * - 고정 윈도우: key당 windowSeconds 동안 limit 회까지 허용
 * - Redis 미연결 시 허용(return true)하여 서비스 가용성 우선
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRateLimitService {

    private final StringRedisTemplate redisTemplate;

    private static final String RATE_PREFIX = "rate:";

    /**
     * Rate Limit 체크 및 카운트 증가
     *
     * @param key           Redis 키 (예: rate:reservation:ip:192.168.1.1)
     * @param limit         윈도우 내 최대 허용 횟수
     * @param windowSeconds 윈도우 길이(초)
     * @return true = 허용, false = 초과(429)
     */
    public boolean tryAcquire(String key, int limit, long windowSeconds) {
        String redisKey = RATE_PREFIX + key;
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count == null) {
                return true;
            }
            if (count == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }
            boolean allowed = count <= limit;
            if (!allowed) {
                log.warn("[RateLimit] 초과 - key={}, count={}, limit={}", key, count, limit);
            }
            return allowed;
        } catch (Exception e) {
            log.warn("[RateLimit] Redis 오류로 허용 처리 - key={}, error={}", key, e.getMessage());
            return true;
        }
    }
}
