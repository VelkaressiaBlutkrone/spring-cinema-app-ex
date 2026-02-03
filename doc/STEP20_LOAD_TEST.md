# Step 20: 부하 테스트 및 성능 최적화

## 목표

- 부하 테스트 수행
- 성능 목표 달성 확인 (PRD: 좌석 클릭 < 200ms, 1000 TPS, 동시 접속 1000명)
- 성능 최적화 적용

## 사전 조건

- MySQL, Redis 실행
- 테스트 데이터 로드 (test_data.sql)
- loadtest 프로파일로 백엔드 기동

## 1. 서버 기동 (loadtest 프로파일)

```bash
./gradlew bootRun --args='--spring.profiles.active=dev,loadtest'
```

loadtest 프로파일 적용 시:

- `LoadTestAuthController` 노출 → `POST /api/loadtest/login` (평문 JSON 로그인)
- Rate Limit 완화 (reservation 10000/분, login 1000/분)

## 2. JMeter 설치

- [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) 5.6+ 다운로드
- 압축 해제 후 `bin/jmeter` (GUI) 또는 `bin/jmeter.sh` (CLI)

## 3. 테스트 계획

| 파일 | 시나리오 | 설명 |
|------|----------|------|
| `loadtest/cinema_seat_hold.jmx` | 좌석 HOLD | Login → GET seats → POST hold (50 users × 10 loops) |

### JMeter 실행 (CLI)

```bash
jmeter -n -t loadtest/cinema_seat_hold.jmx \
  -l loadtest/results.jtl \
  -e -o loadtest/report \
  -Jhost=localhost \
  -Jport=8080 \
  -JscreeningId=1
```

### JMeter 실행 (GUI)

1. `jmeter` 실행
2. `loadtest/cinema_seat_hold.jmx` 열기
3. Run → Start

### 성능 목표 확인

- Summary Report에서 **Average < 200ms** (좌석 HOLD 응답)
- Throughput (TPS) 확인
- 1000 TPS 목표: 사용자 수·루프 증가로 점진적 검증

## 4. 시나리오 확장 (1000 동시 접속)

JMeter에서 Thread Group 수정:

- Threads: 200 ~ 500 (단계적 증가)
- Ramp-up: 30 ~ 60초
- Loops: 5 ~ 10

1000 TPS 목표 시: Threads × Loops / (테스트 시간 초) ≈ 1000

## 5. 적용된 최적화

| 항목 | 내용 |
|------|------|
| 인덱스 | `idx_screening_seat_status_expire` (status, hold_expire_at) 복합 인덱스 추가 |
| Rate Limit | loadtest 프로파일에서 완화 |
| 부하 테스트 전용 로그인 | Hybrid Encryption 없이 JWT 획득 가능 |

## 6. 병목 분석 시 체크

- DB 쿼리: `show-sql: true` (dev) 또는 Slow Query 로그
- Redis: `redis-cli monitor` (실시간 명령 확인)
- Actuator: `GET /actuator/metrics` (JVM, HTTP 메트릭)
