package com.cinema.infrastructure.redis;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis Health Check (Step 18)
 *
 * /actuator/health에 Redis 상태 포함
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisConnectionFactory connectionFactory;

    @Override
    public Health health() {
        try {
            try (var connection = connectionFactory.getConnection()) {
                String pong = connection.ping();
                return Health.up()
                        .withDetail("redis", "connected")
                        .withDetail("ping", pong)
                        .build();
            }
        } catch (Exception e) {
            log.debug("[Redis Health] ping failed: {}", e.getMessage());
            return Health.down()
                    .withDetail("redis", "disconnected")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
