# 서버 구동 가이드

## 1. DB 접속 여부와 상관없이 서버 구동하는 방법

### 개요
개발 환경에서 MySQL/Redis가 실행되지 않은 상태에서도 Spring Boot 서버를 구동할 수 있도록 설정합니다.

### 1.1 application.yml 설정

#### DataSource (HikariCP) 설정
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cinema?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&connectTimeout=5000&socketTimeout=5000&allowPublicKeyRetrieval=true
    username: cinema_user
    password: cinema_password
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      initialization-fail-timeout: -1       # DB 연결 실패해도 서버 시작 (-1: 무한 대기 없이 즉시 실패 허용)
      connection-timeout: 5000              # 연결 타임아웃 5초
      maximum-pool-size: 10
      minimum-idle: 2
```

**핵심 설정:**
- `initialization-fail-timeout: -1`: HikariCP가 초기 연결 실패해도 애플리케이션 시작을 허용
- `connection-timeout: 5000`: 연결 시도 타임아웃을 5초로 제한

#### JPA/Hibernate 설정
```yaml
spring:
  jpa:
    open-in-view: false
    defer-datasource-initialization: true   # DataSource 초기화 지연
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect  # Hibernate 7.x용 dialect 명시
```

**핵심 설정:**
- `defer-datasource-initialization: true`: DataSource 초기화를 지연하여 앱 시작 시점에 DB 연결 필수가 아님
- `dialect: org.hibernate.dialect.MySQLDialect`: DB 연결 없이도 Hibernate가 dialect를 알 수 있도록 명시 (Hibernate 7.x 필수)

#### SQL 초기화 설정
```yaml
spring:
  sql:
    init:
      mode: never                           # SQL 초기화 스크립트 실행 안 함
      continue-on-error: true               # 초기화 에러 시 계속 진행
```

### 1.2 MySQL 연결 URL 파라미터

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| `useSSL` | false | SSL 사용 안 함 (개발 환경) |
| `serverTimezone` | Asia/Seoul | 서버 타임존 설정 |
| `characterEncoding` | UTF-8 | 문자 인코딩 |
| `connectTimeout` | 5000 | 연결 타임아웃 (ms) |
| `socketTimeout` | 5000 | 소켓 타임아웃 (ms) |
| `allowPublicKeyRetrieval` | true | Public Key 인증 허용 (MySQL 8.x 필수) |

### 1.3 Redis 설정
```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 2000ms
      connect-timeout: 5000ms
```

Redis는 기본적으로 연결 실패해도 앱 시작에 영향을 주지 않습니다.

### 1.4 주의사항

1. **DB 연결 실패 시 제한 사항:**
   - JPA Repository 호출 시 예외 발생
   - 트랜잭션 처리 불가
   - 데이터 조회/저장 불가

2. **Redis 연결 실패 시 제한 사항:**
   - 캐시 기능 사용 불가
   - 분산 락 사용 불가
   - Refresh Token 관리 불가

3. **운영 환경에서는 권장하지 않음:**
   - 개발/테스트 환경에서만 사용
   - 운영 환경에서는 DB/Redis 연결 필수로 설정

---

## 2. 서버 접속 로깅

### 개요
애플리케이션 시작 시 MySQL/Redis 연결 상태를 콘솔에 출력하여 인프라 연결 상태를 한눈에 확인합니다.

### 2.1 DatabaseConnectionChecker 구현

```java
package com.cinema.global.config;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
        log.info("┌─ MySQL Database ─────────────────────────────────────────────");

        try (var connection = dataSource.getConnection()) {
            var metaData = connection.getMetaData();
            log.info("│ [✓] Status: CONNECTED");
            log.info("│     URL: {}", metaData.getURL());
            log.info("│     Database: {} {}", metaData.getDatabaseProductName(), metaData.getDatabaseProductVersion());
            log.info("│     Driver: {} {}", metaData.getDriverName(), metaData.getDriverVersion());
        } catch (Exception e) {
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
```

### 2.2 동작 원리

1. **ApplicationRunner 인터페이스:**
   - Spring Boot 애플리케이션이 완전히 시작된 후 `run()` 메서드 실행
   - Bean 초기화가 완료된 시점에 실행되므로 안전하게 연결 테스트 가능

2. **DataSource 연결 테스트:**
   - `dataSource.getConnection()`으로 실제 DB 연결 시도
   - `DatabaseMetaData`로 DB 정보 추출
   - 연결 실패 시 예외를 catch하여 경고 로그 출력

3. **Redis 연결 테스트:**
   - `redisConnectionFactory.getConnection()`으로 연결 획득
   - `ping()` 명령으로 연결 상태 확인
   - "PONG" 응답 시 연결 성공

### 2.3 출력 예시

#### 모든 연결 성공 시:
```
╔════════════════════════════════════════════════════════════╗
║              CONNECTION STATUS CHECK                       ║
╚════════════════════════════════════════════════════════════╝

┌─ MySQL Database ─────────────────────────────────────────────
│ [✓] Status: CONNECTED
│     URL: jdbc:mysql://localhost:3306/cinema
│     Database: MySQL 8.0.33
│     Driver: MySQL Connector/J mysql-connector-j-9.5.0
└────────────────────────────────────────────────────────────────

┌─ Redis Cache ───────────────────────────────────────────────
│ [✓] Status: CONNECTED
│     Response: PONG
└────────────────────────────────────────────────────────────────

╔════════════════════════════════════════════════════════════╗
║              SERVER STARTED SUCCESSFULLY                   ║
╚════════════════════════════════════════════════════════════╝
```

#### 연결 실패 시:
```
╔════════════════════════════════════════════════════════════╗
║              CONNECTION STATUS CHECK                       ║
╚════════════════════════════════════════════════════════════╝

┌─ MySQL Database ─────────────────────────────────────────────
│ [✗] Status: DISCONNECTED
│     Error: HikariPool-1 - Connection is not available, request timed out after 5003ms
│     Note: Server running without DB. Some features unavailable.
└────────────────────────────────────────────────────────────────

┌─ Redis Cache ───────────────────────────────────────────────
│ [✗] Status: DISCONNECTED
│     Error: Unable to connect to localhost:6379
│     Note: Server running without Redis. Cache/Lock unavailable.
└────────────────────────────────────────────────────────────────

╔════════════════════════════════════════════════════════════╗
║              SERVER STARTED SUCCESSFULLY                   ║
╚════════════════════════════════════════════════════════════╝
```

### 2.4 파일 위치

```
src/main/java/com/cinema/global/config/DatabaseConnectionChecker.java
```

---

## 참고사항

- Spring Boot 4.x + Hibernate 7.x 환경 기준
- MySQL 8.x + Redis 최신 버전 호환
- 개발 환경에서만 사용 권장 (운영 환경은 DB 연결 필수)
