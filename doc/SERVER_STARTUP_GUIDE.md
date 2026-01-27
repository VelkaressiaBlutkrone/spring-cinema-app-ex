# 서버 구동 가이드

## 1. 프로파일별 데이터베이스 설정

### 개요
프로젝트는 개발 환경과 운영 환경을 분리하여 관리합니다:
- **개발 환경 (dev)**: H2 인메모리 데이터베이스 사용
- **운영 환경 (prod)**: MySQL 데이터베이스 사용

### 1.1 프로파일 구조

프로젝트는 다음 설정 파일로 구성됩니다:

- `application.yml`: 공통 설정 (JWT, CORS, Seat HOLD, Redisson 등)
- `application-dev.yml`: 개발 환경 설정 (H2 데이터베이스)
- `application-prod.yml`: 운영 환경 설정 (MySQL 데이터베이스)

### 1.2 개발 환경 (dev) - H2 데이터베이스

#### 기본 프로파일
`application.yml`에서 기본 프로파일이 `dev`로 설정되어 있습니다:
```yaml
spring:
  profiles:
    active: dev  # 기본 프로파일: dev (개발 환경)
```

#### H2 데이터베이스 설정
`application-dev.yml`에서 H2 인메모리 데이터베이스를 사용합니다:
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:cinema;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL
    username: sa
    password:
    driver-class-name: org.h2.Driver
    hikari:
      initialization-fail-timeout: -1
      connection-timeout: 5000
      maximum-pool-size: 10
      minimum-idle: 2

  jpa:
    hibernate:
      ddl-auto: update  # 개발 환경: 자동 스키마 생성
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
```

**H2 데이터베이스 특징:**
- 인메모리 데이터베이스로 별도 설치 불필요
- 서버 재시작 시 데이터 초기화
- 개발 및 테스트에 최적화
- `ddl-auto: update`로 엔티티 변경 시 자동 스키마 업데이트

#### 개발 환경 실행 방법
```bash
# 기본 프로파일(dev)로 실행
./gradlew bootRun

# 또는 명시적으로 dev 프로파일 지정
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 1.3 운영 환경 (prod) - MySQL 데이터베이스

#### MySQL 데이터베이스 설정
`application-prod.yml`에서 MySQL 데이터베이스를 사용합니다:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cinema?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&connectTimeout=5000&socketTimeout=5000&allowPublicKeyRetrieval=true
    username: cinema_user
    password: cinema_26118791
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      initialization-fail-timeout: -1
      connection-timeout: 5000
      maximum-pool-size: 10
      minimum-idle: 2

  jpa:
    hibernate:
      ddl-auto: none  # 운영 환경: 스키마 자동 생성 비활성화
    show-sql: false  # 운영 환경: SQL 로그 비활성화
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

**MySQL 데이터베이스 특징:**
- 영구 데이터 저장소
- 운영 환경에 최적화
- `ddl-auto: none`으로 스키마 자동 변경 방지
- SQL 로그 비활성화로 성능 최적화

#### MySQL 연결 URL 파라미터

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| `useSSL` | false | SSL 사용 안 함 (개발 환경) |
| `serverTimezone` | Asia/Seoul | 서버 타임존 설정 |
| `characterEncoding` | UTF-8 | 문자 인코딩 |
| `connectTimeout` | 5000 | 연결 타임아웃 (ms) |
| `socketTimeout` | 5000 | 소켓 타임아웃 (ms) |
| `allowPublicKeyRetrieval` | true | Public Key 인증 허용 (MySQL 8.x 필수) |

#### 운영 환경 실행 방법
```bash
# prod 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=prod'

# 또는 JAR 파일 실행 시
java -jar app.jar --spring.profiles.active=prod
```

### 1.4 Redis 설정

Redis 설정은 프로파일과 무관하게 공통 설정(`application.yml`)에 포함되어 있습니다:
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

### 1.5 주의사항

1. **개발 환경 (H2):**
   - 서버 재시작 시 모든 데이터가 초기화됩니다
   - 개발 및 테스트 목적으로만 사용하세요
   - 운영 환경에서는 절대 사용하지 마세요

2. **운영 환경 (MySQL):**
   - MySQL 서버가 실행 중이어야 합니다
   - 데이터베이스 스키마가 미리 생성되어 있어야 합니다
   - `ddl-auto: none`으로 설정되어 있어 자동 스키마 생성이 비활성화됩니다

3. **Redis 연결 실패 시 제한 사항:**
   - 캐시 기능 사용 불가
   - 분산 락 사용 불가
   - Refresh Token 관리 불가

---

## 2. DB 접속 여부와 상관없이 서버 구동하는 방법

### 개요
개발 환경에서 MySQL/Redis가 실행되지 않은 상태에서도 Spring Boot 서버를 구동할 수 있도록 설정합니다.

**주의:** 이 기능은 개발/테스트 환경에서만 사용하세요. 운영 환경에서는 DB/Redis 연결이 필수입니다.

### 2.1 핵심 설정

#### DataSource (HikariCP) 설정
```yaml
spring:
  datasource:
    hikari:
      initialization-fail-timeout: -1       # DB 연결 실패해도 서버 시작
      connection-timeout: 5000              # 연결 타임아웃 5초
```

**핵심 설정:**
- `initialization-fail-timeout: -1`: HikariCP가 초기 연결 실패해도 애플리케이션 시작을 허용
- `connection-timeout: 5000`: 연결 시도 타임아웃을 5초로 제한

#### JPA/Hibernate 설정
```yaml
spring:
  jpa:
    defer-datasource-initialization: true   # DataSource 초기화 지연
```

**핵심 설정:**
- `defer-datasource-initialization: true`: DataSource 초기화를 지연하여 앱 시작 시점에 DB 연결 필수가 아님

#### SQL 초기화 설정
```yaml
spring:
  sql:
    init:
      mode: never                           # SQL 초기화 스크립트 실행 안 함
      continue-on-error: true               # 초기화 에러 시 계속 진행
```

### 2.2 제한 사항

1. **DB 연결 실패 시 제한 사항:**
   - JPA Repository 호출 시 예외 발생
   - 트랜잭션 처리 불가
   - 데이터 조회/저장 불가

2. **Redis 연결 실패 시 제한 사항:**
   - 캐시 기능 사용 불가
   - 분산 락 사용 불가
   - Refresh Token 관리 불가

---

## 3. 서버 접속 로깅

### 개요
애플리케이션 시작 시 데이터베이스(H2 또는 MySQL)/Redis 연결 상태를 콘솔에 출력하여 인프라 연결 상태를 한눈에 확인합니다.

### 3.1 DatabaseConnectionChecker 구현

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
```

### 3.2 동작 원리

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

### 3.3 출력 예시

#### 개발 환경 (H2) 연결 성공 시:
```
╔════════════════════════════════════════════════════════════╗
║              CONNECTION STATUS CHECK                       ║
╚════════════════════════════════════════════════════════════╝

┌─ H2 Database ─────────────────────────────────────────────
│ [✓] Status: CONNECTED
│     URL: jdbc:h2:mem:cinema
│     Database: H2 2.2.224
│     Driver: H2 JDBC Driver 2.2.224
└────────────────────────────────────────────────────────────────

┌─ Redis Cache ───────────────────────────────────────────────
│ [✓] Status: CONNECTED
│     Response: PONG
└────────────────────────────────────────────────────────────────

╔════════════════════════════════════════════════════════════╗
║              SERVER STARTED SUCCESSFULLY                   ║
╚════════════════════════════════════════════════════════════╝
```

#### 운영 환경 (MySQL) 연결 성공 시:
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

┌─ Database ─────────────────────────────────────────────
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

### 3.4 파일 위치

```
src/main/java/com/cinema/global/config/DatabaseConnectionChecker.java
```

---

## 참고사항

- Spring Boot 4.x + Hibernate 7.x 환경 기준
- 개발 환경: H2 인메모리 데이터베이스 (별도 설치 불필요)
- 운영 환경: MySQL 8.x + Redis 최신 버전 호환
- 프로파일 전환: `--spring.profiles.active=dev` 또는 `--spring.profiles.active=prod`
