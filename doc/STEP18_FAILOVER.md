# Step 18: 장애 대응 및 복구 로직

## 개요

Redis 장애 시 예매 기능을 보호하고, 복구 시 자동으로 상태를 동기화하는 로직을 구현합니다.

## Redis 사용 영역

| 영역 | 용도 | 장애 시 동작 |
|------|------|--------------|
| 좌석 상태 캐시 | seat:status:{screeningId} | DB Fallback (읽기 유지) |
| 좌석 HOLD | seat:hold:{screeningId}:{seatId} | Fail Fast (예매 차단) |
| Refresh Token | refresh:token:{memberId} | 로그아웃/재로그인 필요 |
| Rate Limit | rate:* | 허용 (가용성 우선) |
| 분산 락 | lock:* | 로컬 락 폴백 |

## 설정

```yaml
# application.yml
cinema:
  redis:
    fail-fast-on-write: true     # true: Redis 장애 시 예매 차단
    health-check-interval-ms: 30000
    recovery-sync-enabled: true
```

```yaml
# application-dev.yml (로컬 개발)
cinema:
  redis:
    fail-fast-on-write: false    # Redis 없이 로컬 폴백 허용
```

## Health Check

- **엔드포인트**: `GET /actuator/health`
- **Redis 상세**: `redis`, `ping`, `available` 필드 포함
- **장애 시**: `status: DOWN`, `redis: disconnected`

## 복구 흐름

1. `RedisHealthChecker`가 30초마다 Redis ping
2. 연결 끊김 감지 → `redisAvailable=false`, ERROR 로그
3. 이후 HOLD/결제 요청 → `requireAvailableForWrite()` → 503 응답
4. Redis 복구 감지 → `redisAvailable=true`, INFO 로그
5. `RedisStateSyncService.syncHoldsFromDbToRedis()` 실행
6. DB의 HOLD 좌석을 Redis에 재등록
7. 예매 기능 정상화

## 테스트 방법

1. **Redis 중지**: `docker stop cinema-redis` 또는 Redis 프로세스 종료
2. **Health 확인**: `curl http://localhost:8080/actuator/health`
3. **예매 시도**: 좌석 HOLD → 503 응답 (prod/fail-fast=true)
4. **Redis 재시작**: `docker start cinema-redis`
5. **복구 대기**: 약 30초 이내 Health UP, 로그에 "복구 감지" 출력
6. **예매 재시도**: 정상 동작
