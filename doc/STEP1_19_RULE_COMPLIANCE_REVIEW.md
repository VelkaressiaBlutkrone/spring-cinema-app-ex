# Step 1~19 RULE.md 준수 검토

> 검토일: 2026-02-03
> 대상: Step 1~19 구현 코드 vs doc/RULE.md

## 1. 준수 확인 항목 (Compliant)

| RULE 항목 | 검토 결과 |
|-----------|----------|
| **1.1 좌석 상태 변경 제어** | ✅ 좌석 상태 변경은 `SeatCommandService` 단일 진입점만 사용. Entity 내부 메서드(hold, releaseHold 등)는 Service에서만 호출 |
| **1.2 Redis/DB 역할 분리** | ✅ Redis는 HOLD/캐시, DB가 최종 진실. 결제 성공 시 DB 커밋 → Redis 정리 순서 준수 |
| **1.3 클라이언트 신뢰 금지** | ✅ 가격·좌석 정보는 `PriceCalculateService`에서 서버 계산. 클라이언트 전달값 미신뢰 |
| **1.4 비동기 이벤트 멱등성** | ✅ SSE 이벤트에 eventId 포함, 클라이언트 중복 처리 가능 |
| **2.1 레이어 의존성** | ✅ Controller → Service → Domain → Infrastructure 방향 유지 |
| **2.3 QueryDSL** | ✅ `@Query` JPQL 미사용. ReservationRepository, ScreeningRepository, ScreenRepository, ScreeningSeatRepository 모두 QueryDSL Custom Repository 패턴 사용 |
| **4.1 좌석 상태 7단계** | ✅ SeatStatus enum: AVAILABLE, HOLD, PAYMENT_PENDING, RESERVED, CANCELLED, BLOCKED, DISABLED |
| **4.2.1 HOLD** | ✅ Redis + TTL 사용, HOLD Token(UUID) 발급, 검증 필수 |
| **4.3 분산 락** | ✅ `lock:screening:{screeningId}:seat:{seatId}` 형식, 락 실패 시 즉시 실패(SEAT_LOCK_FAILED) |
| **5.1 트랜잭션 범위** | ✅ 결제 프로세스 HOLD→PAYMENT_PENDING→RESERVED/AVAILABLE, DB 커밋 후 Redis 정리 |
| **5.2 Controller @Transactional** | ✅ Controller에 @Transactional 없음. Service 레이어에서만 관리 |
| **6.1 Polling 금지 / SSE** | ✅ Polling 미사용. SSE 단일 사용(WebSocket 혼용 없음) |
| **6.2 이벤트** | ✅ 좌석 상태 변경 시만 Push, 변경 좌석 ID만 전달, 전체 재전송 없음 |
| **7.1 Redis Key** | ✅ `seat:hold:{screeningId}:{seatId}`, `seat:status:{screeningId}` 준수 |
| **7.2 TTL** | ✅ HOLD Key에 TTL 설정 (`Duration.ofMinutes(ttlMinutes)`) |
| **9.1 JWT** | ✅ Access Token ≤15분, Refresh Token Redis 저장 |
| **9.2 관리자 API** | ✅ `/admin/**` Role 기반 접근, @PreAuthorize 적용 |
| **9.4 HOLD Token 검증** | ✅ 결제·해제 시 holdToken 검증 |
| **10.1 Mock 결제** | ✅ MockPaymentService 사용 |
| **10.2 결제 실패** | ✅ PAYMENT_PENDING → AVAILABLE 복구 |
| **10.3 결제 위변조** | ✅ 서버에서 가격·좌석 재계산 검증 |
| **11.1 필수 로그** | ✅ HOLD/해제, 락 실패, 결제 성공/실패, 장애 로깅 |
| **11.2 로그 금지** | ✅ 개인정보·결제상세·JWT 전체값 로그 미기록 |
| **13.1 Redis 장애** | ✅ 읽기 DB Fallback, 쓰기 Fail Fast(requireAvailableForWrite) |
| **13.2 자동 복구** | ✅ HoldExpiryScheduler, RedisStateSyncService |

---

## 2. 위반 또는 보완 필요 항목

### 2.1 Domain Layer Spring Annotation (RULE 2.2)

**RULE**: Domain Layer에 Spring Annotation 사용 금지. `@Entity`, `@Component` 등 사용 금지.

| 위치 | 내용 | 조치 |
|------|------|------|
| ~~`domain/screening/scheduler/HoldExpiryScheduler.java`~~ | ~~`@Component`, `@Scheduled`, `@Transactional` 사용~~ | ✅ **수정완료**: `infrastructure/scheduler/HoldExpiryScheduler.java`로 이동 |
| `domain/**/entity/*.java` | `@Entity` (JPA) 사용 | **참고**: RULE 2.2는 @Entity 금지로 기재되어 있으나, TASK Step 2 체크리스트는 "JPA 어노테이션만 사용"으로 완화. 현 구조는 JPA 기반 ORM을 전제로 하므로, RULE.md와 TASK.md 간 해석 정리 필요. |

### 2.2 IllegalStateException 사용 (RULE 14.2)

**RULE**: 비즈니스 로직에서 `IllegalStateException`, `IllegalArgumentException` 사용 금지.

| 위치 | 내용 | 조치 |
|------|------|------|
| ~~`global/security/RsaKeyManager.java:45`~~ | ~~`throw new IllegalStateException("RSA not available", e)`~~ | ✅ **수정완료**: `BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e)`로 변경 |

### 2.3 RULE.md 내부 불일치

| 항목 | RULE 4.3.1 | RULE 7.1 | 구현 |
|------|------------|----------|------|
| 분산 락 Key | `lock:screening:{screeningId}:seat:{seatId}` | ~~`lock:seat:{screeningId}:{seatId}`~~ | 4.3.1과 동일하게 구현됨 |
| 조치 | - | ✅ **수정완료**: RULE 7.1을 `lock:screening:{screeningId}:seat:{seatId}`로 통일 |

---

## 3. Step별 핵심 검증 요약

| Step | 검증 포인트 | 결과 |
|------|------------|------|
| 1 | Docker, MySQL, Redis 인프라 | ✅ |
| 2 | Entity, SeatStatus, Aggregate | ✅ |
| 3 | JWT, Refresh Token Redis | ✅ |
| 4 | Admin API Role, CRUD | ✅ |
| 5 | Redis 캐시, DB Fallback | ✅ |
| 6 | SeatCommandService, 분산 락, HOLD Token, TTL | ✅ |
| 7 | 결제 트랜잭션, Mock 결제, 가격 서버 계산 | ✅ |
| 8 | SSE 단일 사용, 이벤트 멱등성 | ✅ |
| 9~12 | React 사용자 웹 | ✅ |
| 13~14 | 관리자 웹, 인증 | ✅ |
| 15~16 | Flutter 모바일 | ✅ |
| 17 | Rate Limit, 보안 | ✅ |
| 18 | Redis 장애 대응, Fail Fast, 동기화 | ✅ |
| 19 | 테스트, JaCoCo | ✅ |

---

## 4. 적용된 수정 사항

1. ✅ **HoldExpiryScheduler** → `infrastructure.scheduler` 패키지로 이동 (RULE 2.2 준수)
2. ✅ **RULE.md 7.1** → 분산 락 Key를 `lock:screening:{screeningId}:seat:{seatId}`로 수정
3. ✅ **RsaKeyManager** → IllegalStateException → BusinessException(ErrorCode.INTERNAL_SERVER_ERROR) 전환

---

## 5. 결론

- **핵심 RULE(1.1~1.4, 4.x, 5.x, 6.x, 7.x, 9.x, 10.x, 11.x, 13.x)** 준수.
- 위 수정으로 식별된 RULE 위반 사항은 모두 반영 완료.
