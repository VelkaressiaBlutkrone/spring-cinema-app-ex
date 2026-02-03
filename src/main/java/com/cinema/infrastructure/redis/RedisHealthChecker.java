package com.cinema.infrastructure.redis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis 주기적 Health Check 및 장애 감지 (Step 18)
 *
 * - Redis ping으로 연결 상태 확인
 * - redisAvailable 동적 업데이트
 * - 장애/복구 시 로그 및 상태 동기화 트리거
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisHealthChecker {

    private final RedisConnectionFactory connectionFactory;
    private final RedisService redisService;
    private final RedisStateSyncService redisStateSyncService;

    @Value("${cinema.redis.health-check-interval-ms:30000}")
    private long healthCheckIntervalMs;

    @Value("${cinema.redis.recovery-sync-enabled:true}")
    private boolean recoverySyncEnabled;

    private volatile boolean lastKnownAvailable = true;

    /**
     * 주기적으로 Redis 연결 상태 확인
     * redisAvailable 플래그 업데이트, 복구 시 DB→Redis 동기화
     */
    @Scheduled(fixedDelayString = "${cinema.redis.health-check-interval-ms:30000}", initialDelay = 10000)
    public void checkRedisHealth() {
        boolean connected = pingRedis();
        boolean wasAvailable = lastKnownAvailable;
        redisService.setAvailable(connected);
        lastKnownAvailable = connected;

        if (!wasAvailable && connected) {
            log.info("[Redis] 복구 감지 - 연결 복원됨. 상태 동기화 진행.");
            if (recoverySyncEnabled) {
                try {
                    redisStateSyncService.syncHoldsFromDbToRedis();
                } catch (Exception e) {
                    log.warn("[Redis] 복구 후 상태 동기화 실패: {}", e.getMessage());
                }
            }
        } else if (wasAvailable && !connected) {
            log.error("[Redis] 장애 감지 - 연결 끊김. 예매(HOLD/결제) 기능 일시 중단.");
        }
    }

    private boolean pingRedis() {
        try {
            try (var connection = connectionFactory.getConnection()) {
                String pong = connection.ping();
                return "PONG".equals(pong);
            }
        } catch (Exception e) {
            return false;
        }
    }
}
