package com.cinema.global.config;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 애플리케이션 시작 시 DB/Redis 연결 상태를 확인하고 로깅합니다.
 * 연결 실패해도 서버는 정상 실행됩니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseConnectionChecker implements ApplicationRunner {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    @Override
    public void run(ApplicationArguments args) {
        log.info("");
        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║              CONNECTION STATUS CHECK                       ║");
        log.info("╚════════════════════════════════════════════════════════════╝");

        checkDatabaseConnection();
        checkRedisConnection();

        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║              SERVER STARTED SUCCESSFULLY                   ║");
        log.info("╚════════════════════════════════════════════════════════════╝");
        log.info("");
    }

    private void checkDatabaseConnection() {
        log.info("");
        
        try (var connection = dataSource.getConnection()) {
            var metaData = connection.getMetaData();
            var dbName = metaData.getDatabaseProductName();
            log.info("┌─ {} Database ─────────────────────────────────────────────", dbName);
            log.info("│ [✓] Status: CONNECTED");
            log.info("│     URL: {}", metaData.getURL());
            log.info("│     Database: {} {}", dbName, metaData.getDatabaseProductVersion());
            log.info("│     Driver: {} {}", metaData.getDriverName(), metaData.getDriverVersion());
        } catch (Exception e) {
            log.info("┌─ Database ─────────────────────────────────────────────");
            log.warn("│ [✗] Status: DISCONNECTED");
            log.warn("│     Error: {}", e.getMessage());
            log.warn("│     Note: Server running without DB. Some features unavailable.");
        }

        log.info("└────────────────────────────────────────────────────────────────");
    }

    private void checkRedisConnection() {
        log.info("");
        log.info("┌─ Redis Cache ───────────────────────────────────────────────");

        try (var connection = redisConnectionFactory.getConnection()) {
            var ping = connection.ping();
            if ("PONG".equals(ping)) {
                log.info("│ [✓] Status: CONNECTED");
                log.info("│     Response: {}", ping);
            } else {
                log.warn("│ [?] Status: UNKNOWN (ping: {})", ping);
            }
        } catch (Exception e) {
            log.warn("│ [✗] Status: DISCONNECTED");
            log.warn("│     Error: {}", e.getMessage());
            log.warn("│     Note: Server running without Redis. Cache/Lock unavailable.");
        }

        log.info("└────────────────────────────────────────────────────────────────");
    }
}
