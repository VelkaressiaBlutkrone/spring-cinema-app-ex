# 운영 가이드 (Step 21)

## 1. 모니터링

### 1.1 Health Check

```bash
# 전체 상태
curl http://localhost:8080/actuator/health

# Redis 상태 포함
curl http://localhost:8080/actuator/health | jq
```

응답 예시:
```json
{
  "status": "UP",
  "components": {
    "redis": { "status": "UP" },
    "db": { "status": "UP" }
  }
}
```

### 1.2 로그

| 구분 | 위치 | 보관 |
|------|------|------|
| Backend | `logs/` 또는 stdout | logback-spring.xml (7일) |
| Frontend/Mobile | Backend `/api/logs` → app.frontend, app.mobile | 7일 |

### 1.3 메트릭

- Actuator 기본 노출: `health` 엔드포인트
- 추가 메트릭: `management.endpoints.web.exposure.include: health,metrics` (필요 시)

---

## 2. 장애 대응

### 2.1 Redis 장애

- **증상**: 예매(HOLD/결제) 불가, `REDIS_SERVICE_UNAVAILABLE` 응답
- **조치**:
  1. Redis 컨테이너/프로세스 상태 확인
  2. Redis 복구 시 `RedisStateSyncService`가 DB HOLD → Redis 자동 동기화
  3. `RedisHealthChecker` 30초 주기로 상태 갱신

### 2.2 DB 연결 실패

- **증상**: 503, DB 연결 타임아웃
- **조치**: MySQL 상태 확인, connection pool 설정 검토

### 2.3 좌석 HOLD 만료

- `HoldExpiryScheduler`가 1분마다 만료 HOLD 자동 해제
- 별도 개입 불필요

---

## 3. 백업 및 복구

### 3.1 MySQL

```bash
# 백업
docker exec cinema-db mysqldump -u root -p cinema > backup_$(date +%Y%m%d).sql

# 복구
docker exec -i cinema-db mysql -u root -p cinema < backup_YYYYMMDD.sql
```

### 3.2 Redis

- HOLD 데이터는 일시적(TTL) → DB가 최종 진실
- Redis 장애 시 DB Fallback으로 조회 가능

---

## 4. 보안 점검

- [ ] JWT_SECRET 운영용으로 설정
- [ ] MySQL/Redis 비밀번호 강화
- [ ] CORS 허용 오리진 제한
- [ ] Rate Limit 설정 확인 (reservation, admin)
- [ ] Swagger UI 프로덕션 비활성화 검토
- [ ] HTTPS 적용 (Nginx, Load Balancer)

---

## 5. 성능

- 좌석 클릭 응답 < 200ms (PRD)
- Redis 캐시 TTL: 5분 (seat:status)
- HOLD TTL: 7분 (설정 가능)

---

## 6. 참고 문서

- [STEP18_FAILOVER.md](./STEP18_FAILOVER.md) - Redis 장애 대응
- [LOGGING.md](./LOGGING.md) - 로깅 설정
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
