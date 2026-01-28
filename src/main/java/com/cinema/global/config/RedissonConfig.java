package com.cinema.global.config;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

/**
 * Redisson 설정 - 분산 락을 위한 Redis 클라이언트
 *
 * RULE 4.3: 분산 락 규칙
 * - 락 키 규칙: lock:screening:{screeningId}:seat:{seatId}
 * - 락 획득 실패 시 즉시 실패 응답
 * - Redis 연결 실패 시 서버는 계속 실행 (락/캐시 기능 비활성화)
 */
@Slf4j
@Configuration
public class RedissonConfig {

    private RedissonClient redissonClientInstance;

    @Value("${redisson.single-server-config.address}")
    private String address;

    @Value("${redisson.single-server-config.connection-minimum-idle-size:5}")
    private int connectionMinimumIdleSize;

    @Value("${redisson.single-server-config.connection-pool-size:10}")
    private int connectionPoolSize;

    @Value("${redisson.single-server-config.idle-connection-timeout:10000}")
    private int idleConnectionTimeout;

    @Value("${redisson.single-server-config.connect-timeout:5000}")
    private int connectTimeout;

    @Value("${redisson.single-server-config.timeout:3000}")
    private int timeout;

    @Value("${redisson.single-server-config.retry-attempts:3}")
    private int retryAttempts;

    @Value("${redisson.single-server-config.retry-interval:1500}")
    private int retryInterval;

    /**
     * RedissonClient 빈 생성
     * - Redis 연결 실패 시 null 반환 (서버는 계속 실행)
     * - null인 경우 분산 락 기능 비활성화됨
     */
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();

        config.useSingleServer()
                .setAddress(address)
                .setConnectionMinimumIdleSize(connectionMinimumIdleSize)
                .setConnectionPoolSize(connectionPoolSize)
                .setIdleConnectionTimeout(idleConnectionTimeout)
                .setConnectTimeout(connectTimeout)
                .setTimeout(timeout)
                .setRetryAttempts(retryAttempts)
                .setRetryInterval(retryInterval);

        try {
            redissonClientInstance = Redisson.create(config);
            log.info("[Redisson] Redis 연결 성공: {}", address);
            return redissonClientInstance;
        } catch (Exception e) {
            log.error("┌─ Redisson ──────────────────────────────────────────────────");
            log.error("│ [✗] Redis 연결 실패: {}", address);
            log.error("│     Error: {}", e.getMessage());
            log.error("│     Note: 서버는 계속 실행됩니다. 분산 락/HOLD 기능이 비활성화됩니다.");
            log.error("└────────────────────────────────────────────────────────────────");
            return null;
        }
    }

    @PreDestroy
    public void shutdown() {
        if (redissonClientInstance != null && !redissonClientInstance.isShutdown()) {
            log.info("[Redisson] RedissonClient 종료 중...");
            redissonClientInstance.shutdown();
        }
    }
}
