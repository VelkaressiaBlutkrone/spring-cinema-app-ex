# Cinema App 프로젝트 관련 문제

## 문제: QueryDSL Q클래스 "The type Q... is already defined" 중복 정의

**에러 메시지:**

```
The type QMember is already defined
The type QMovie is already defined
... (QPayment, QReservation, QScreen, QScreening, QSeat 등)
```

**발생 경로 예:**

- `bin\generated-sources\annotations\com\cinema\domain\...\entity\Q*.java`

**원인:**

- Gradle은 `build/generated/querydsl`에 Q클래스를 생성하고, IDE(Eclipse/일부 Java 확장)는 `bin/generated-sources/annotations`에 별도로 생성함
- 두 경로가 모두 소스/클래스패스에 포함되면 같은 Q 타입이 두 번 정의되어 "already defined" 발생

**해결 방법:**

1. **`bin` 폴더 삭제**  
   로컬에 있는 `bin` 폴더를 삭제해 IDE가 만든 생성소스만 제거합니다.

   ```powershell
   # 프로젝트 루트에서
   Remove-Item -Recurse -Force bin -ErrorAction SilentlyContinue
   ```

2. **Gradle로만 빌드**  
   Q클래스는 Gradle의 `compileJava` 결과인 `build/generated/querydsl`만 사용해야 합니다.

   ```powershell
   .\gradlew clean compileJava
   ```

3. **IDE에서 Gradle 사용**
   - **Cursor/VS Code**: `Ctrl+Shift+P` → **"Java: Clean Java Language Server Workspace"** 실행 후 창 새로고침. 빌드는 Gradle 뷰에서 "Build" 또는 "compileJava" 사용.
   - IntelliJ: "Build → Rebuild Project" 시 Gradle 사용, 또는 "Use Gradle for build" 옵션 사용.
   - Eclipse: `.\gradlew eclipse` 후 프로젝트 다시 import하면 `.classpath`가 `build/generated/querydsl`을 참조.

4. **`bin`이 다시 생기지 않게**  
   `bin/`은 `.gitignore`에 들어 있음. `.vscode/settings.json`에 `java.import.exclusions`로 `bin`을 Java 임포트에서 제외해 두었으므로, "Java: Clean Java Language Server Workspace" 후에는 `bin`이 클래스패스에 들어오지 않도록 할 수 있음.

**참고:**

- 이 프로젝트의 Q클래스 생성 위치는 `build.gradle`의 `querydslDir` = `build/generated/querydsl` 하나뿐입니다.

---

## 문제: Could not find or load main class com.cinema.CinemaApplication

**에러 메시지:**

```
Error: Could not find or load main class com.cinema.CinemaApplication
Caused by: java.lang.ClassNotFoundException: com.cinema.CinemaApplication
```

**원인:**

- 실행 시 사용하는 클래스패스에 `build/classes/java/main`(또는 해당 메인 클래스가 들어 있는 출력 디렉터리)이 포함되지 않음
- IDE가 Gradle이 아닌 다른 방식(예: 빈 `bin/`)으로 프로젝트를 인식해 잘못된 출력 경로를 쓰는 경우
- 아직 빌드를 하지 않아 `CinemaApplication.class`가 없음

**해결 방법:**

1. **Gradle로 빌드 후 `bootRun`으로 실행 (가장 안정적)**

   ```powershell
   .\gradlew clean bootRun
   ```

   또는 터미널에서 `.\gradlew bootRun`만 실행해도 됨. Gradle이 클래스패스를 맞춰서 실행함.

2. **VS Code/Cursor에서 실행**
   - **실행(디버그 없음)**: `Ctrl+Shift+P` → **"Tasks: Run Task"** → **bootRun** 선택. 또는 Gradle 뷰 → **Tasks** → **application** → **bootRun**.
   - **디버깅**(Run 버튼/F5로 ClassNotFoundException 나는 경우):
     1. `Ctrl+Shift+P` → **"Tasks: Run Task"** → **bootRunDebug** 선택
     2. 터미널에 `Started CinemaApplication` 등이 뜰 때까지 대기
     3. `F5` 또는 Run > Start Debugging → 구성 **"Attach to Spring Boot (Gradle bootRun)"** 선택
   - Gradle이 클래스패스를 맞춰 주므로, 위 방식이 ClassNotFoundException 없이 동작함.

3. **Java Language Server 초기화**
   - Run으로 실행했는데 위 오류가 나면: `Ctrl+Shift+P` → **"Java: Clean Java Language Server Workspace"** 실행 후 창 새로고침
   - 그러면 Gradle 기준으로 프로젝트를 다시 불러와, 클래스패스에 `build/classes`가 포함됨

4. **launch 구성 확인**
   - `.vscode/launch.json`에 **Spring Boot-CinemaApplication** 구성이 있고, `mainClass`가 `com.cinema.CinemaApplication`, `projectName`이 `cinema-backend`인지 확인

**참고:**

- 메인 클래스 파일은 Gradle 빌드 시 `build/classes/java/main/com/cinema/CinemaApplication.class`에 생성됨.
- `.\gradlew bootRun`은 이 경로를 클래스패스에 넣고 실행하므로, IDE 설정이 꼬여 있어도 터미널에서만 실행할 때는 이 방법이 가장 확실함.

---

## 문제: Redisson Spring Boot 스타터로 인한 ApplicationContext 기동 실패 (Spring Boot 4)

**에러 메시지:**

```
Application run failed
java.lang.IllegalStateException: Failed to generate bean name for imported class 'org.redisson.spring.starter.RedissonAutoConfigurationV2'
	...
Caused by: java.lang.ClassNotFoundException: org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
```

**원인:**

- `redisson-spring-boot-starter`(3.40.x)는 **Spring Boot 3** 기준으로 빌드되어, 내부에서 `org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration`을 참조합니다.
- **Spring Boot 4.x**에서는 자동 설정 모듈 구조/패키지가 바뀌어 위 클래스를 찾지 못해 `ClassNotFoundException`이 발생합니다.
- 이 프로젝트는 이미 `RedissonConfig`에서 `RedissonClient` 빈을 수동 등록하고 있어, 스타터의 자동 설정은 필수가 아닙니다.

**해결 방법:**

### build.gradle 수정

`redisson-spring-boot-starter` 대신 **Redisson 코어만** 사용하도록 변경합니다.

```gradle
// 변경 전 (Spring Boot 4에서 오류 발생)
implementation 'org.redisson:redisson-spring-boot-starter:3.40.2'

// 변경 후
implementation 'org.redisson:redisson:3.40.2'
```

- `RedissonConfig`(`RedissonClient` 빈 수동 등록)와 `application.yml`의 `redisson.single-server-config.*` 설정은 그대로 두면 됩니다.
- 분산 락 등 기존 Redisson 사용 방식은 동일하게 동작합니다.

**참고:**

- Spring Boot 4 전용 Redisson 스타터(예: 4.1.x)가 나온다면, 호환 버전으로 스타터를 다시 사용하는 방법도 있습니다.
- 현재는 "스타터 제거 + 코어만 사용"이 가장 안정적인 우회 방법입니다.

---

## 문제: Redis 연결 실패 시 서버가 종료됨 (Graceful Degradation)

**에러 메시지:**

```
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'distributedLockManager'...
Caused by: org.redisson.client.RedisConnectionException: Unable to connect to Redis server: localhost/127.0.0.1:6379
```

**원인:**

- `RedissonConfig`에서 `Redisson.create(config)` 호출 시 Redis 연결을 즉시 시도
- Redis 서버가 실행 중이지 않으면 `RedisConnectionException` 발생
- `RedissonClient` 빈이 생성되지 않으면 의존하는 모든 빈(`DistributedLockManager`, `SeatCommandService` 등)도 생성 실패
- 결과적으로 전체 Spring Boot 애플리케이션이 시작되지 않음

**해결 방법:**

Redis 연결 실패 시에도 서버가 계속 실행되도록 Graceful Degradation 패턴을 적용합니다.

### 1. RedissonConfig.java 수정

연결 실패 시 예외를 잡아서 null을 반환하고 에러 로그만 출력:

```java
@Slf4j
@Configuration
public class RedissonConfig {

    private RedissonClient redissonClientInstance;

    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
                .setAddress(address)
                // ... 기타 설정 ...

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
```

### 2. DistributedLockManager.java 수정

`ObjectProvider`를 사용하여 빈이 없어도 주입 가능하게 하고, null 체크 추가:

```java
@Slf4j
@Component
public class DistributedLockManager {

    private final RedissonClient redissonClient;

    public DistributedLockManager(ObjectProvider<RedissonClient> redissonClientProvider) {
        this.redissonClient = redissonClientProvider.getIfAvailable();
        if (redissonClient == null) {
            log.warn("[Lock] RedissonClient가 null입니다. 분산 락 기능이 비활성화됩니다.");
        }
    }

    public boolean isAvailable() {
        return redissonClient != null;
    }

    public boolean tryLock(String lockKey, long waitTime, long leaseTime) {
        if (redissonClient == null) {
            log.warn("[Lock] Redis 미연결 상태로 락 획득 실패: {}", lockKey);
            return false;
        }
        // ... 나머지 로직 ...
    }
}
```

### 3. RedisService.java / RefreshTokenService.java 수정

모든 Redis 작업에 try-catch 추가하여 연결 실패 시 로그만 출력하고 적절한 기본값 반환.

**동작 방식:**

| Redis 상태 | 서버 시작 | 분산 락 | 캐시/HOLD | 인증(Refresh Token) |
|-----------|----------|---------|----------|-------------------|
| 연결됨 | 정상 | 정상 | 정상 | 정상 |
| 미연결 | 정상 | 비활성화 (항상 실패) | 비활성화 (DB Fallback) | 비활성화 (저장 안 됨) |

**주의사항:**

- Redis 없이 서버가 시작되면 **좌석 HOLD/분산 락 기능이 비활성화**됩니다.
- 동시성 제어가 필요한 좌석 예매 기능은 정상 동작하지 않습니다.
- 개발/테스트 환경에서만 사용하고, **운영 환경에서는 Redis가 필수**입니다.

---

## 문제: 패키지 구조 중복 (screen vs screening)

**원인:**

- `domain/screen` 패키지와 `domain/screening` 패키지가 혼재
- Entity 정의가 중복됨

**해결 방법:**

1. `domain/screen` 패키지의 파일들 삭제
2. `domain/screening` 패키지로 통합
3. DDD 원칙에 따라 Aggregate Root(Screening) 중심으로 구조화

**변경된 패키지 구조:**

```
domain/
├── member/           # 회원 도메인
├── movie/            # 영화 도메인
├── theater/          # 영화관 도메인
├── screening/        # 상영 도메인 (Aggregate Root)
│   ├── entity/
│   │   ├── Screening.java      # Aggregate Root
│   │   ├── Screen.java
│   │   ├── Seat.java
│   │   ├── ScreeningSeat.java
│   │   └── (Enum 파일들)
│   └── repository/
├── reservation/      # 예매 도메인
└── payment/          # 결제 도메인
```

---

## 문제: JPA Entity에서 Lazy Loading 관련 N+1 문제

**원인:**

- `@ManyToOne(fetch = FetchType.LAZY)` 설정 시 연관 엔티티 조회에서 N+1 쿼리 발생

**해결 방법:**

Repository에서 Fetch Join 사용:

```java
@Query("SELECT s FROM Screening s " +
       "JOIN FETCH s.movie " +
       "JOIN FETCH s.screen " +
       "WHERE s.id = :id")
Optional<Screening> findByIdWithMovieAndScreen(@Param("id") Long id);
```

---

## 문제: SeatStatus Enum 7단계 정의

**RULE.md 4.1에 따른 좌석 상태 정의:**

```java
public enum SeatStatus {
    AVAILABLE,        // 예매 가능
    HOLD,             // 임시 점유
    PAYMENT_PENDING,  // PG 요청 중
    RESERVED,         // 결제 완료
    CANCELLED,        // 예매 취소
    BLOCKED,          // 운영 차단
    DISABLED          // 물리적 사용 불가
}
```

**상태 전이 규칙:**

- AVAILABLE → HOLD (좌석 선택)
- HOLD → PAYMENT_PENDING (결제 시작)
- PAYMENT_PENDING → RESERVED (결제 성공)
- PAYMENT_PENDING → AVAILABLE (결제 실패)
- RESERVED → CANCELLED (예매 취소)
- 관리자 설정: BLOCKED, DISABLED

---

## 경고: WebMvcConfigurer.configureMessageConverters deprecated

**경고 메시지:**

```
warning: [removal] configureMessageConverters(List<HttpMessageConverter<?>>) in WebMvcConfigurer has been deprecated and marked for removal
```

**원인:**

- Spring Boot 4.0에서 `configureMessageConverters` 메서드가 deprecated됨
- 향후 버전에서 제거 예정

**현재 상태:**

- 기능은 정상 작동함
- 추후 `extendMessageConverters` 또는 다른 방식으로 마이그레이션 필요

**향후 해결 방안:**

1. `HttpMessageConverters` Bean 등록 방식으로 변경
2. 또는 Spring Boot 공식 마이그레이션 가이드 참조

```java
// 대안 예시
@Bean
public HttpMessageConverters customConverters(Gson gson) {
    GsonHttpMessageConverter gsonConverter = new GsonHttpMessageConverter();
    gsonConverter.setGson(gson);
    return new HttpMessageConverters(gsonConverter);
}
```

---

## 문제: 도메인 예외 처리 불일치

**원인:**

- Entity의 비즈니스 메서드에서 `IllegalStateException`, `IllegalArgumentException` 등 Java 기본 예외 사용
- API 응답에서 일관된 에러 코드 및 메시지 제공 어려움
- 예외 로깅 시 컨텍스트 정보 부족

**해결 방법:**

### 1. 도메인별 예외 클래스 생성

```java
// 결제 예외
public class PaymentException extends BusinessException {
    private final Long paymentId;
    private final Long reservationId;
    // ...
}

// 예매 예외
public class ReservationException extends BusinessException {
    private final Long reservationId;
    private final String reservationNo;
    // ...
}
```

### 2. ErrorCode에 세부 코드 추가

```java
// 상영 스케줄 관련
SCREENING_CANNOT_START(HttpStatus.BAD_REQUEST, "SCREENING_004", "상영을 시작할 수 없는 상태입니다."),

// 예매 관련
RESERVATION_CANNOT_START_PAYMENT(HttpStatus.BAD_REQUEST, "RESERVATION_004", "결제를 시작할 수 없는 상태입니다."),

// 결제 관련
PAYMENT_CANNOT_COMPLETE(HttpStatus.BAD_REQUEST, "PAYMENT_005", "결제를 완료할 수 없는 상태입니다."),
```

### 3. Entity에서 공통 예외 사용

```java
// 변경 전
public void cancel() {
    if (this.payStatus != PaymentStatus.SUCCESS) {
        throw new IllegalStateException("취소할 수 없는 결제 상태입니다.");
    }
}

// 변경 후
public void cancel() {
    if (this.payStatus != PaymentStatus.SUCCESS) {
        throw new PaymentException(ErrorCode.PAYMENT_CANNOT_CANCEL,
                String.format("paymentId=%d, 현재 상태: %s", this.id, this.payStatus));
    }
}
```

**장점:**

- API 응답에서 일관된 에러 코드 제공
- 예외 로깅 시 컨텍스트 정보(ID 등) 포함
- 클라이언트에서 에러 코드 기반 처리 가능
- 도메인별 예외 분리로 코드 가독성 향상
