# 로깅 가이드

백엔드, 프론트엔드, 모바일 앱의 로그 수집·저장 정책입니다.
모든 로그 파일은 **최대 7일** 보관 후 자동 삭제됩니다.

---

## 1. 백엔드 (Spring Boot)

| 파일 | 내용 |
|------|------|
| `logs/application.log` | 애플리케이션 로그 (일별 rolling: `application.yyyy-MM-dd.log`) |
| `logs/frontend.log` | 프론트엔드에서 전송한 클라이언트 로그 |
| `logs/mobile.log` | 모바일에서 전송한 클라이언트 로그 |

- **설정**: `src/main/resources/logback-spring.xml`
- **보관 기간**: `maxHistory=7` (7일)
- dev/prod 공통 적용

---

## 2. 프론트엔드 (React)

- **패키지**: `loglevel`
- **출력**: 콘솔 + 백엔드 `POST /api/logs` 전송 → `logs/frontend.log` 저장
- **로그 대상**:
  - 화면 이동 (NavigationLogger)
  - 좌석 HOLD/해제 (SeatSelectPage)
  - 예매 완료 (PaymentPage)
  - 관리자 등록/수정 (영화, 영화관, 상영관, 상영 스케줄, 좌석)

---

## 3. 모바일 (Flutter)

- **패키지**: `logger`, `path_provider`
- **출력**:
  - 콘솔 (개발용)
  - 로컬 파일: 앱 문서 디렉터리 `/logs/cinema-mobile-yyyy-MM-dd.log`
  - 백엔드 `POST /api/logs` 전송 → `logs/mobile.log` 저장 (선택)
- **로그 대상**:
  - 화면 이동 (AppNavigatorObserver)
  - 좌석 HOLD/해제 (SeatSelectScreen)
  - 예매 완료 (PaymentScreen)

---

## 보안·개인정보

- 개인정보, 결제 상세, JWT 전체 값은 로그에 기록하지 않습니다.
