# 부하 테스트 (Step 20)

상세 가이드: [doc/STEP20_LOAD_TEST.md](../doc/STEP20_LOAD_TEST.md)

## 빠른 실행

```bash
# 1. 서버 기동 (loadtest 프로파일)
./gradlew bootRun --args='--spring.profiles.active=dev,loadtest'

# 2. JMeter CLI 실행
jmeter -n -t loadtest/cinema_seat_hold.jmx -l loadtest/results.jtl -e -o loadtest/report -Jhost=localhost -Jport=8080
```

## 테스트 계획

| 파일 | 시나리오 |
|------|----------|
| cinema_seat_hold.jmx | Login → GET seats → POST hold (50 users × 10 loops) |

## 성능 목표 (PRD)

- 좌석 클릭 → 반영 < 200ms
- 최대 1000 TPS
- 동시 접속자 1000명
