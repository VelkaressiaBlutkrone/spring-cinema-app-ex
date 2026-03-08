# Spring 백엔드 리팩토링 계획

## 개요

- **프레임워크**: Spring Boot 4.0.2 + JPA + QueryDSL + Redis + Redisson
- **아키텍처**: DDD 기반 레이어드 (Controller → Service → Repository → Entity)
- **패키지 구조**: `domain/` (비즈니스), `global/` (공통), `infrastructure/` (인프라), `application/` (앱 레벨)
- **소스 파일 수**: 약 150개 (Java)

## 전체 평가

| 카테고리 | 상태 | 비고 |
|---------|------|------|
| 패키지 구조 | ✅ 양호 | 도메인별 분리 명확, 레이어 의존성 준수 |
| Controller | ✅ 개선됨 | `@Valid` 추가 완료, 인증 처리 불일치는 Phase 2 |
| Service | ✅ 개선됨 | `findActiveMember` 헬퍼 추출, `notifySeatChange` 헬퍼 추출 |
| Repository | ✅ 양호 | QueryDSL 적용, 일부 최적화 필요 |
| 예외 처리 | ✅ 개선됨 | `catch(Exception e)` → 구체적 예외 분류 완료 (5개 파일) |
| 트랜잭션 | ⚠️ 보통 | 경계 불명확, readOnly 미일관 |
| 보안 설정 | ✅ 개선됨 | CORS localhost 제한 적용 완료 |
| DTO 검증 | ✅ 개선됨 | `@Valid` + `@NotBlank/@Pattern/@Size/@Email` 추가 완료 |
| 코드 중복 | ✅ 개선됨 | `findActiveMember`, `notifySeatChange` 헬퍼로 중복 제거 |

---

## Phase 1: 높은 우선순위 (보안/안정성)

### 1.1 ~~❗ CORS 와일드카드 + Credentials 취약점 수정~~ ✅ 적용 완료

**심각도**: Critical — 보안 취약점

**파일**: [CorsConfig.java](src/main/java/com/cinema/global/config/CorsConfig.java):32-42

**문제**: 개발 모드에서 `addAllowedOriginPattern("*")` + `setAllowCredentials(true)` 조합 → CSRF 공격 가능

**수정**:
```java
// 현재
config.addAllowedOriginPattern("*");
config.setAllowCredentials(true);

// 수정 — 와일드카드 대신 로컬 개발 URL만 허용
if ("*".equals(allowedOrigins)) {
    config.addAllowedOriginPattern("http://localhost:*");
}
```

### 1.2 ~~`catch(Exception e)` 일괄 개선~~ ✅ 적용 완료

**심각도**: High — 디버깅 어려움, 에러 은폐

**약 20건 발견 — 주요 대상 파일**:

| 파일 | 위치 | 수정 방향 |
|------|------|----------|
| [RedisService.java](src/main/java/com/cinema/infrastructure/redis/RedisService.java) | :110, :150, :180, :198, :220, :236, :253, :274, :295, :311 | `RedisConnectionFailureException`, `RedisSystemException` 분리 |
| [DistributedLockManager.java](src/main/java/com/cinema/infrastructure/lock/DistributedLockManager.java) | :89, :149, :161 | `InterruptedException`, `TimeoutException` 분리 |
| [RedisRateLimitService.java](src/main/java/com/cinema/infrastructure/redis/RedisRateLimitService.java) | :49 | Redis 전용 예외 분리 |
| [HoldExpiryScheduler.java](src/main/java/com/cinema/infrastructure/scheduler/HoldExpiryScheduler.java) | :62 | 스케줄러 전용 예외 분리 |
| [HybridDecryptionService.java](src/main/java/com/cinema/global/security/HybridDecryptionService.java) | :62 | 복호화 전용 예외 분리 |

**수정 패턴**:
```java
// 현재
catch (Exception e) {
    log.error("Redis 연결 실패", e);
}

// 수정
catch (RedisConnectionFailureException | RedisSystemException e) {
    log.error("Redis 인프라 오류: {}", e.getMessage());
} catch (JsonProcessingException e) {
    log.error("직렬화 오류: {}", e.getMessage());
}
```

### 1.3 ~~DTO 입력 검증 보강~~ ✅ 적용 완료

**문제**: 여러 DTO에 `@Valid` 어노테이션 및 검증 제약조건 누락

**대상 파일**:

| 파일 | 문제 | 수정 |
|------|------|------|
| [MemberController.java](src/main/java/com/cinema/domain/member/controller/MemberController.java):57-61 | `@RequestBody EncryptedPayload` — `@Valid` 없음 | `@Valid` 추가 |
| [MemberRequest.java](src/main/java/com/cinema/domain/member/dto/MemberRequest.java) | SignUp, Login 내부 클래스에 검증 어노테이션 없음 | `@NotBlank`, `@Pattern`, `@Size` 추가 |
| [PaymentRequest.java](src/main/java/com/cinema/domain/payment/dto/PaymentRequest.java) | 결제 요청 검증 부족 | 필수 필드 검증 추가 |

**MemberRequest 수정 예시**:
```java
public static class SignUp {
    @NotBlank(message = "loginId는 필수입니다")
    @Pattern(regexp = "^[a-zA-Z0-9]{4,20}$", message = "loginId 형식 불일치")
    private String loginId;

    @NotBlank
    @Size(min = 8, message = "비밀번호는 8자 이상")
    private String password;
}
```

### 1.4 ~~GlobalExceptionHandler 보강 확인~~ ✅ 이미 구현됨

`GlobalExceptionHandler`가 이미 존재하며 다음 핸들러가 모두 구현되어 있음:

- `MethodArgumentNotValidException` (Bean Validation 실패) ✅
- `ConstraintViolationException` (파라미터 검증 실패) ✅
- `BusinessException`, `SeatException`, `PaymentException`, `ReservationException`, `ScreeningException`, `MemberException` 등 도메인 예외 ✅
- `AuthenticationException`, `AccessDeniedException` 등 보안 예외 ✅
- 최종 방어선 `Exception` 핸들러 ✅

---

## Phase 2: 중간 우선순위 (코드 품질)

### 2.1 장메서드 분리 — `processPayment()`

**파일**: [ReservationPaymentService.java](src/main/java/com/cinema/domain/reservation/service/ReservationPaymentService.java):64-147

**문제**: 84줄의 단일 메서드에 5가지 책임 혼재
- 결제 요청 검증
- 좌석 상태 전이 (HOLD → PAYMENT_PENDING)
- 결제 실행
- 예매 생성
- 좌석 확정 + 이벤트 발행

**수정** — 메서드 분리:
```java
public ReservationResponse processPayment(PaymentRequest request) {
    PaymentContext ctx = validatePaymentRequest(request);
    transitionSeatsToPaymentPending(ctx);
    Payment payment = executePayment(ctx);
    Reservation reservation = createReservation(ctx, payment);
    finalizeSeats(ctx);
    return toResponse(reservation);
}

private PaymentContext validatePaymentRequest(PaymentRequest request) { ... }
private void transitionSeatsToPaymentPending(PaymentContext ctx) { ... }
private Payment executePayment(PaymentContext ctx) { ... }
private Reservation createReservation(PaymentContext ctx, Payment payment) { ... }
private void finalizeSeats(PaymentContext ctx) { ... }
```

### 2.2 코드 중복 제거

#### 엔티티 조회 + 예외 패턴 (~30건)

**문제**: 모든 서비스에서 반복되는 패턴
```java
Entity entity = repository.findById(id)
    .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
```

**수정**: 유틸리티 메서드 추출
```java
// global/util/EntityFinder.java - 생성
public static <T> T requireFound(Optional<T> optional, ErrorCode code) {
    return optional.orElseThrow(() -> new BusinessException(code));
}

// 사용
Member member = requireFound(memberRepository.findByLoginId(loginId), ErrorCode.MEMBER_NOT_FOUND);
```

#### ~~회원 활성 상태 검증 (4건+)~~ ✅ 적용 완료

**파일**: [MemberService.java](src/main/java/com/cinema/domain/member/service/MemberService.java):178-184, :226-230

```java
// 현재 (중복)
if (!member.isActive()) {
    throw new BusinessException(ErrorCode.MEMBER_DISABLED);
}

// 수정 — private 헬퍼
private Member findActiveMember(String loginId) {
    Member member = requireFound(memberRepository.findByLoginId(loginId), ErrorCode.MEMBER_NOT_FOUND);
    if (!member.isActive()) throw new BusinessException(ErrorCode.MEMBER_DISABLED);
    return member;
}
```

#### 분산 락 + try-finally 패턴 (4건)

**파일**: [SeatCommandService.java](src/main/java/com/cinema/domain/screening/service/SeatCommandService.java):64-79, :146-161, :199-221, :227-252

**수정**: `DistributedLockManager`에 함수형 인터페이스 패턴 추가
```java
// DistributedLockManager.java 확장
public <T> T executeWithLock(Long screeningId, Long seatId, Supplier<T> action) {
    if (!tryLockSeat(screeningId, seatId)) {
        throw SeatException.lockFailed(seatId);
    }
    try {
        return action.get();
    } finally {
        unlockSeat(screeningId, seatId);
    }
}
```

#### ~~좌석 상태 변경 후 캐시 무효화 + 이벤트 발행 (5건+)~~ ✅ 적용 완료

**파일**: [SeatCommandService.java](src/main/java/com/cinema/domain/screening/service/SeatCommandService.java):120, :187, :216, :247, :286

```java
// 현재 (반복)
seatStatusQueryService.invalidateSeatStatusCache(screeningId);
seatEventPublisher.publishSeatStatusChanged(screeningId, List.of(seatId));

// 수정 — private 헬퍼
private void notifySeatChange(Long screeningId, Long... seatIds) {
    seatStatusQueryService.invalidateSeatStatusCache(screeningId);
    seatEventPublisher.publishSeatStatusChanged(screeningId, List.of(seatIds));
}
```

### 2.3 트랜잭션 경계 명확화

| 파일 | 문제 | 수정 |
|------|------|------|
| [ReservationPaymentService.java](src/main/java/com/cinema/domain/reservation/service/ReservationPaymentService.java):64 | 결제+예매+좌석 상태 단일 트랜잭션 | 결제/예매 트랜잭션 분리 검토 |
| [SeatCommandService.java](src/main/java/com/cinema/domain/screening/service/SeatCommandService.java) | 트랜잭션 전파 방식 미명시 | `Propagation.REQUIRES_NEW` 명시 (필요 시) |
| 읽기 전용 서비스 | `readOnly = true` 미일관 적용 | `SeatStatusQueryService` 등 조회 서비스에 일관 적용 |

### 2.4 Controller 인증 처리 통합

**문제**: `resolveMemberId()` / `resolveMemberIdOrNull()` 패턴이 컨트롤러마다 중복

**대상 파일**:
- [ReservationController.java](src/main/java/com/cinema/domain/reservation/controller/ReservationController.java):88-95
- [ScreeningController.java](src/main/java/com/cinema/domain/screening/controller/ScreeningController.java):136-150

**수정 방안**:
- `HandlerMethodArgumentResolver` 구현으로 `@CurrentMemberId Long memberId` 어노테이션 지원
- 또는 `@ControllerAdvice`에서 공통 처리

---

## Phase 3: 낮은 우선순위 (최적화/개선)

### 3.1 Repository 최적화

#### findAll() 메모리 효율성

**파일**:
- [AdminMovieService.java](src/main/java/com/cinema/domain/admin/service/AdminMovieService.java):102
- [AdminTheaterService.java](src/main/java/com/cinema/domain/admin/service/AdminTheaterService.java):93

**문제**: `repository.findAll().stream().map(Response::new).toList()` — 전체 로딩

**수정**: 페이지네이션 적용 또는 결과 제한

#### 불필요한 distinct() 제거

**파일**: [ReservationRepositoryImpl.java](src/main/java/com/cinema/domain/reservation/repository/ReservationRepositoryImpl.java):63

**문제**: `leftJoin` + `distinct()` 조합 → 대량 데이터 시 성능 저하

#### in-memory groupBy → DB GROUP BY 전환

**파일**: [MemberService.java](src/main/java/com/cinema/domain/member/service/MemberService.java):236-264

**문제**: `Collectors.groupingBy()` Java 인메모리 처리 → DB 레벨 `GROUP BY` 쿼리로 전환

#### 선택적 fetchJoin 최적화

**파일**: [ScreeningSeatRepositoryImpl.java](src/main/java/com/cinema/domain/screening/repository/ScreeningSeatRepositoryImpl.java):56-67

**문제**: 4개 테이블 fetchJoin → 조회 목적에 따라 필요한 조인만 수행

#### 누락 인덱스 추가

| 엔티티/컬럼 | 사용 위치 | 필요 인덱스 |
|------------|----------|------------|
| `Movie.status` | 영화 조회 쿼리 | `@Index` 추가 |
| `Payment.reservationId` | `findByReservationIdAndPayStatus` | `@Index` 추가 |

### 3.2 DTO 개선

#### DTO 불변성 적용

**문제**: `@Setter` 사용으로 DTO가 가변적 → 서비스 레이어에서 의도치 않은 변경 가능

**대상**: [MemberRequest.java](src/main/java/com/cinema/domain/member/dto/MemberRequest.java) 내부 클래스들

**수정**: Java 16+ `record` 타입 또는 빌더 패턴으로 전환
```java
public record SignUpRequest(
    @NotBlank String loginId,
    @NotBlank @Size(min = 8) String password,
    @NotBlank @Email String email
) {}
```

#### 응답 DTO 세분화

**문제**: `MovieResponse`, `ScreeningResponse` 등이 목록 조회와 상세 조회에서 동일 DTO 사용

**수정**: `MovieListResponse` (최소 필드) vs `MovieDetailResponse` (전체 필드) 분리

#### 응답 Envelope 일관성

**문제**: 일부 엔드포인트는 원시 리스트 반환, 일부는 `ApiResponse<T>` 래핑 — 불일치

**대상**: `HomeController`의 `getUpcomingMovies()` 등

### 3.3 매직 스트링 제거

**파일**: [ScreeningController.java](src/main/java/com/cinema/domain/screening/controller/ScreeningController.java):138

```java
// 현재
if ("anonymousUser".equals(authentication.getPrincipal())) { ... }

// 수정
if (authentication instanceof AnonymousAuthenticationToken) { ... }
```

### 3.4 JSON 직렬화 설정 최적화

**파일**: [GsonConfig.java](src/main/java/com/cinema/global/config/GsonConfig.java)

| 위치 | 문제 | 수정 |
|------|------|------|
| :40 | `setPrettyPrinting()` 전역 적용 | 프로파일별 분리 (dev만 활성화) |
| :33 | 날짜 포맷 `yyyy-MM-dd'T'HH:mm:ss` — 타임존 없음 | ISO 8601 완전 준수: `yyyy-MM-dd'T'HH:mm:ss.SSSXXX` |

### 3.5 캐시 무효화 최적화

**파일**: [SeatCommandService.java](src/main/java/com/cinema/domain/screening/service/SeatCommandService.java):120, :187, :216

**문제**: 좌석 1개 변경 시 전체 상영 캐시 무효화

**수정**: 변경된 좌석만 선택적 캐시 업데이트 (delta 방식)

### 3.6 배치 오퍼레이션 도입

**파일**: [AdminScreeningService.java](src/main/java/com/cinema/domain/admin/service/AdminScreeningService.java):73-82

**문제**: ScreeningSeat를 루프에서 개별 save → N번 INSERT

**수정**: `saveAll()` 배치 저장

---

## RULE.md 준수 점검

| 규칙 | 현재 상태 | 비고 |
|------|----------|------|
| 좌석 변경은 SeatCommandService 단일 진입점 | ✅ 준수 | |
| Redis → DB 직접 수정 금지 | ✅ 준수 | |
| Domain Layer Spring Annotation 금지 | ⚠️ 확인 필요 | JPA 어노테이션 사용 중 (허용 범위) |
| QueryDSL 우선 사용 | ✅ 진행 중 | Custom Repository 패턴 적용됨 |
| Controller @Transactional 금지 | ✅ 준수 | |
| 공통 예외 사용 | ✅ 준수 | BusinessException + ErrorCode 체계 |
| HOLD TTL 필수 | ✅ 준수 | Redis TTL 설정됨 |
| 개인정보 로그 금지 | ⚠️ 확인 필요 | 구조화된 로깅 미적용 |

---

## 테스트 전략

| 단계 | 범위 | 도구 |
|------|------|------|
| 1단계 | 도메인 서비스 단위 테스트 | JUnit 5 + Mockito |
| 2단계 | Repository 통합 테스트 | @DataJpaTest + H2/TestContainers |
| 3단계 | Controller API 테스트 | @WebMvcTest + MockMvc |
| 4단계 | 전체 통합 테스트 | @SpringBootTest |
| 5단계 | 부하 테스트 | K6 / Gatling (기존 LoadTest 활용) |
