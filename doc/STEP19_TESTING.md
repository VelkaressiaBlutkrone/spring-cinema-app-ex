# Step 19: 테스트 가이드

## 실행 방법

| 명령 | 설명 |
|------|------|
| `./gradlew test` | 단위 테스트 실행 (Docker 불필요) |
| `./gradlew integrationTest` | 통합 테스트 실행 (Docker + Testcontainers 필요) |
| `./gradlew test jacocoTestReport` | 단위 테스트 + JaCoCo 커버리지 리포트 생성 |

## 단위 테스트

- **SeatStatusTest**: 좌석 상태 enum 검증
- **ScreeningSeatTest**: 좌석 상태 전이 (hold, releaseHold, startPayment, reserve, cancel)
- **PriceCalculateServiceTest**: 가격 계산 서비스 (Mockito)
- **MockPaymentServiceTest**: Mock 결제 서비스

## 통합 테스트

- **ScreeningApiIntegrationTest** (`@Tag("integration")`)
  - Testcontainers로 Redis 컨테이너 기동
  - GET /api/public-key, GET /api/movies 호출 검증
  - Docker 데몬 필요

## 테스트 프로파일

- `application-test.yml`: H2 인메모리 DB, cinema.redis.fail-fast-on-write: false
- 통합 테스트 시 `@ActiveProfiles("test")` 사용

## 커버리지

- **JaCoCo** 리포트: `build/reports/jacoco/test/html/index.html`
- 제외: config, dto, entity, *Application
