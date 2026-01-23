# 영화관 예매 시스템 개발 작업 계획 (Task Plan)

## 개요

본 문서는 PRD.md와 RULE.md를 기반으로 한 상세 개발 작업 계획입니다. 각 Step은 순차적으로 진행되며, 각 단계별로 완료 체크리스트를 포함합니다.

---

## Step 1: 프로젝트 생성 및 환경 설정 (Docker, DB, Redis)

### 목표

- 개발 환경 인프라 구축
- Docker Compose를 통한 로컬 개발 환경 구성

### 작업 내용

- [x] 프로젝트 루트 디렉토리 구조 생성
- [x] Docker Compose 파일 작성 (MySQL, Redis)
- [x] MySQL 컨테이너 설정 및 초기 스키마 준비
- [x] Redis 컨테이너 설정
- [x] Nginx 설정 파일 준비 (추후 사용)
- [x] 환경 변수 설정 파일 (.env) 작성
- [x] README.md 작성 (환경 설정 가이드)

### 체크리스트

- [ ] `docker-compose up -d` 실행 시 MySQL, Redis 정상 기동
- [ ] MySQL 접속 확인
- [ ] Redis 접속 확인 (redis-cli)
- [ ] 포트 충돌 없음 확인

### 예상 소요 시간

2-3일 → **완료 (2026-01-22)**

---

## Step 2: Spring Boot 기본 세팅 및 엔티티(Entity) 설계

### 목표

- Spring Boot 프로젝트 초기 설정
- DDD 기반 Domain Entity 설계
- 레이어 구조 설정

### 작업 내용

- [x] Spring Boot 프로젝트 생성 (Gradle/Maven) - Spring Boot 4.0.2 기반
- [x] 의존성 설정 (Spring Web, JPA, Redis, Security, Redisson 등)
- [x] 패키지 구조 설정 (Controller, Application, Domain, Infrastructure)
- [x] Domain Entity 설계:
  - [x] Member (회원) - `domain/member/entity/Member.java`
  - [x] Movie (영화) - `domain/movie/entity/Movie.java`
  - [x] Theater (상영관) - `domain/theater/entity/Theater.java`
  - [x] Screening (상영 스케줄) - Aggregate Root - `domain/screening/entity/Screening.java`
  - [x] Seat (좌석), ScreeningSeat - Screening 소속 - `domain/screening/entity/Seat.java`, `ScreeningSeat.java`
  - [x] Reservation (예매) - `domain/reservation/entity/Reservation.java`
  - [x] Payment (결제) - `domain/payment/entity/Payment.java`
- [x] SeatStatus Enum 정의 (AVAILABLE, HOLD, PAYMENT_PENDING, RESERVED, CANCELLED, BLOCKED, DISABLED)
- [x] JPA Entity 매핑 (Infrastructure Layer 통합)
- [x] Repository 인터페이스 정의 (Domain 기준)
- [x] application.yml 설정 (DB, Redis 연결)

### 체크리스트

- [x] Domain Layer에 Spring Annotation 최소화 확인 (JPA 어노테이션만 사용)
- [x] Aggregate Root와 일반 Entity 구분 명확 (Screening이 Aggregate Root)
- [x] 좌석은 Screening Aggregate 소속 확인 (ScreeningSeat → Screening)
- [x] 레이어 의존성 규칙 준수 (역방향 의존 없음)
- [x] 애플리케이션 컴파일 성공 확인 (2026-01-23)

### 완료된 패키지 구조

```
domain/
├── member/           # 회원 도메인
│   ├── entity/       Member, MemberStatus, MemberRole
│   ├── repository/   MemberRepository
│   ├── controller/
│   ├── service/
│   └── dto/
├── movie/            # 영화 도메인
│   ├── entity/       Movie, MovieStatus
│   ├── repository/   MovieRepository
│   └── service/      ScreeningService
├── theater/          # 영화관 도메인
│   ├── entity/       Theater, TheaterStatus
│   └── repository/   TheaterRepository
├── screening/        # 상영 도메인 (Aggregate Root)
│   ├── entity/       Screening, Screen, Seat, ScreeningSeat
│   │                 ScreeningStatus, ScreenStatus, ScreenType
│   │                 SeatStatus, SeatType, SeatBaseStatus
│   ├── repository/   ScreeningRepository, ScreenRepository, SeatRepository, ScreeningSeatRepository
│   └── controller/   ScreeningController
├── reservation/      # 예매 도메인
│   ├── entity/       Reservation, ReservationSeat, ReservationStatus
│   └── repository/   ReservationRepository
└── payment/          # 결제 도메인
    ├── entity/       Payment, PaymentStatus, PaymentMethod
    └── repository/   PaymentRepository
```

### 예상 소요 시간

2-3일 → **완료 (2026-01-23)**

---

## Step 3: 회원(Member) 도메인 및 JWT 인증/인가 구현

### 목표

- 회원 가입/로그인 기능
- JWT + Refresh Token 인증 시스템
- Spring Security 설정

### 작업 내용

- [ ] Member Domain 설계 및 구현
- [ ] 회원 가입 API 구현
- [ ] 로그인 API 구현
- [ ] JWT Token 생성/검증 로직
- [ ] Refresh Token 관리 (Redis 저장)
- [ ] Spring Security 설정:
  - [ ] JWT 필터 구현
  - [ ] 인증/인가 설정
  - [ ] Access Token 유효시간 ≤ 15분 설정
- [ ] 토큰 갱신 API 구현
- [ ] 로그아웃 API 구현 (Redis 토큰 삭제)
- [ ] 예외 처리 (인증 실패, 토큰 만료 등)

### 체크리스트

- [ ] Access Token 유효시간 ≤ 15분 확인
- [ ] Refresh Token은 Redis에 저장 확인
- [ ] JWT Token 전체 값이 로그에 기록되지 않음 확인
- [ ] 회원 가입/로그인 정상 동작 확인
- [ ] 토큰 갱신 정상 동작 확인

### 예상 소요 시간

3-4일

---

## Step 4: 영화/상영관(Admin) 도메인 API 구현

### 목표

- 관리자용 영화 및 상영관 관리 API
- 상영 스케줄 관리 API
- 가격 정책 관리 API
- 좌석 배치 설정 API

### 작업 내용

- [ ] Movie Domain 설계 및 구현
- [ ] Theater Domain 설계 및 구현
- [ ] Screening Domain 설계 및 구현
- [ ] 관리자 API 경로 설정 (`/admin/**`)
- [ ] Role 기반 접근 제어 구현:
  - [ ] ADMIN Role 검증
  - [ ] 일반 사용자 접근 차단
- [ ] 영화 관리 API:
  - [ ] 영화 등록
  - [ ] 영화 수정
  - [ ] 영화 삭제
  - [ ] 영화 목록 조회
- [ ] 상영관 관리 API:
  - [ ] 상영관 등록
  - [ ] 상영관 수정
  - [ ] 상영관 삭제
- [ ] 상영 스케줄 관리 API:
  - [ ] 상영 스케줄 등록
  - [ ] 상영 스케줄 수정
  - [ ] 상영 스케줄 삭제
- [ ] 가격 정책 관리 API:
  - [ ] 시간대별 가격 설정
  - [ ] 좌석 등급별 가격 설정
- [ ] 좌석 배치 설정 API:
  - [ ] 상영관별 좌석 배치 설정
  - [ ] 좌석 타입 설정
  - [ ] 좌석 상태 관리 (BLOCKED, DISABLED 설정)
- [ ] 관리자 API Rate Limit 설정

### 체크리스트

- [ ] `/admin/**` 경로는 Role 기반 접근 필수 확인
- [ ] 관리자 API 별도 Rate Limit 적용 확인
- [ ] 일반 사용자는 관리자 API 접근 불가 확인
- [ ] 모든 관리자 API 인증/권한 검사 확인
- [ ] CRUD 기능 정상 동작 확인
- [ ] 좌석 상태 관리 (BLOCKED, DISABLED) 기능 확인

### 예상 소요 시간

4-5일

---

## Step 5: 핵심 로직 1 - 좌석 배치 및 조회 (Redis 캐싱 전략)

### 목표

- 좌석 배치 정보 조회 API
- Redis 캐싱 전략 구현
- DB Fallback 로직 구현

### 작업 내용

- [ ] 좌석 배치 조회 API 구현
- [ ] Redis 캐싱 전략 설계:
  - [ ] Key 네이밍: `seat:status:{screeningId}`
  - [ ] 캐시 만료 시간 설정
- [ ] Redis 캐시 조회 로직 구현
- [ ] Redis 장애 시 DB Fallback 로직 구현:
  - [ ] 읽기: DB Fallback
  - [ ] 쓰기: 예매 차단 (Fail Fast)
- [ ] 좌석 상태 조회 최적화
- [ ] 캐시 무효화 전략 설계

### 체크리스트

- [ ] Redis Key 네이밍 규칙 준수 확인
- [ ] Redis 장애 시 DB Fallback 동작 확인
- [ ] 좌석 상태 조회 성능 확인 (< 200ms 목표)
- [ ] 캐시 일관성 확인

### 예상 소요 시간

2-3일

---

## Step 6: 핵심 로직 2 - 좌석 선점(HOLD) 및 분산 락(Redisson)

### 목표

- 좌석 HOLD 기능 구현
- 분산 락을 통한 동시성 제어
- HOLD Token 발급 및 검증

### 작업 내용

- [ ] SeatCommandService 구현 (단일 진입점)
- [ ] 분산 락 구현 (Redisson):
  - [ ] 락 키 규칙: `lock:screening:{screeningId}:seat:{seatId}`
  - [ ] 락 획득 실패 시 즉시 실패 응답
- [ ] 좌석 HOLD 로직 구현:
  - [ ] Redis에 HOLD 정보 저장
  - [ ] Key: `seat:hold:{screeningId}:{seatId}`
  - [ ] TTL 설정 (5~10분, 설정값 기반)
  - [ ] HOLD Token 발급 (UUID)
- [ ] HOLD Token 검증 로직
- [ ] HOLD 해제 로직
- [ ] HOLD 타임아웃 자동 해제 스케줄러 구현
- [ ] 좌석 HOLD API 구현
- [ ] 좌석 HOLD 해제 API 구현

### 체크리스트

- [ ] 좌석 상태 변경이 SeatCommandService를 통해서만 이루어지는지 확인
- [ ] 분산 락이 좌석 변경 시 사용되는지 확인
- [ ] HOLD Token 발급 및 검증 확인
- [ ] TTL이 모든 HOLD Key에 설정되어 있는지 확인
- [ ] 락 획득 실패 시 즉시 실패 응답 확인
- [ ] HOLD 타임아웃 자동 해제 동작 확인
- [ ] 동시성 테스트 (중복 HOLD 방지)

### 예상 소요 시간

4-5일

---

## Step 7: 핵심 로직 3 - 예매 및 결제 트랜잭션 (Mock 결제)

### 목표

- 예매 트랜잭션 구현
- Mock 결제 시스템 구현
- 트랜잭션 보장 및 일관성 유지

### 작업 내용

- [ ] 예매 도메인 로직 구현:
  - [ ] Reservation Aggregate 설계
  - [ ] 예매 생성 로직
- [ ] 결제 도메인 로직 구현:
  - [ ] Payment Aggregate 설계
  - [ ] Mock 결제 서비스 구현
- [ ] 예매 트랜잭션 구현:
  - [ ] HOLD Token 검증
  - [ ] 가격 계산 (Domain Service)
  - [ ] 좌석 상태 전이: HOLD → PAYMENT_PENDING
  - [ ] 결제 검증 (Mock PG 요청)
  - [ ] 결제 성공 시: PAYMENT_PENDING → RESERVED
  - [ ] DB 저장 (트랜잭션)
  - [ ] Redis HOLD 정리
  - [ ] 순서: 결제 검증 → DB 저장 → Redis 정리
- [ ] 결제 실패 처리:
  - [ ] PAYMENT_PENDING → AVAILABLE (또는 HOLD 해제)
  - [ ] HOLD 자동 해제
  - [ ] 트랜잭션 롤백
  - [ ] 재시도 옵션 제공
- [ ] 예매 취소 로직:
  - [ ] RESERVED → CANCELLED 상태 전이
  - [ ] 취소 처리 및 환불 로직
- [ ] 예매 API 구현
- [ ] 결제 API 구현
- [ ] 예매 내역 조회 API
- [ ] 예매 취소 API:
  - [ ] 예매 취소 로직 (RESERVED → CANCELLED)
  - [ ] 취소 처리 및 환불 로직

### 체크리스트

- [ ] 트랜잭션이 Controller가 아닌 Service에서 관리되는지 확인
- [ ] 결제 정보는 서버에서만 검증 확인
- [ ] HOLD Token 검증 확인
- [ ] 좌석 상태 전이 정상 동작 확인 (HOLD → PAYMENT_PENDING → RESERVED/AVAILABLE)
- [ ] 결제 실패 시 PAYMENT_PENDING → AVAILABLE 상태 전이 확인
- [ ] 트랜잭션 일관성 확인
- [ ] 중복 예매 0% 보장 확인
- [ ] 결제 성공/실패 로깅 확인
- [ ] 예매 취소 시 RESERVED → CANCELLED 상태 전이 확인

### 예상 소요 시간

4-5일

---

## Step 8: 실시간 좌석 갱신 (WebSocket/SSE)

### 목표

- 실시간 좌석 상태 갱신 기능
- WebSocket 또는 SSE 구현
- 이벤트 기반 Push 메시지

### 작업 내용

- [ ] 통신 방식 선택 (WebSocket 또는 SSE)
- [ ] WebSocket/SSE 서버 구현:
  - [ ] 연결 관리
  - [ ] 구독 관리 (상영별)
- [ ] 좌석 상태 변경 이벤트 발행:
  - [ ] 좌석 상태 변경 시만 Push
  - [ ] 변경 좌석 ID만 전달
  - [ ] 전체 좌석 재전송 금지
- [ ] 이벤트 멱등성 보장:
  - [ ] 이벤트 ID 기반 중복 처리 방지
- [ ] 좌석 상태 변경 시 이벤트 발행 로직 연동
- [ ] 연결 해제 처리
- [ ] 에러 처리 및 재연결 로직

### 체크리스트

- [ ] Polling 방식 사용하지 않음 확인
- [ ] WebSocket/SSE 중 하나만 사용 (혼용 금지)
- [ ] 좌석 상태 변경 시만 Push 확인
- [ ] 변경 좌석 ID만 전달 확인
- [ ] 전체 좌석 재전송 금지 확인
- [ ] 이벤트 멱등성 보장 확인
- [ ] 실시간 갱신 정상 동작 확인

### 예상 소요 시간

3-4일

---

## Step 9: 사용자 웹 (React) - 메인 및 영화 목록

### 목표

- React 프로젝트 초기 설정
- 메인 페이지 구현
- 영화 목록 및 상영 시간표 조회

### 작업 내용

- [ ] React + TypeScript 프로젝트 생성 (Vite)
- [ ] 프로젝트 구조 설정
- [ ] API 클라이언트 설정 (Axios 등)
- [ ] 상태 관리 설정 (Context API / Zustand 등)
- [ ] 라우팅 설정 (React Router)
- [ ] 메인 페이지 구현:
  - [ ] 레이아웃 구성
  - [ ] 네비게이션 바
  - [ ] 로그인/로그아웃 UI
- [ ] 영화 목록 페이지 구현:
  - [ ] 영화 목록 조회 API 연동
  - [ ] 영화 카드 UI
  - [ ] 영화 상세 정보 모달
- [ ] 상영 시간표 조회:
  - [ ] 날짜별 상영 스케줄 조회
  - [ ] 상영 시간표 UI
- [ ] 로딩 상태 처리
- [ ] 에러 처리

### 체크리스트

- [ ] Vite, React, TypeScript 사용 확인
- [ ] 영화 목록 정상 조회 확인
- [ ] 상영 시간표 정상 조회 확인
- [ ] 로딩/에러 상태 처리 확인

### 예상 소요 시간

3-4일

---

## Step 10: 사용자 웹 (React) - 좌석 선택 (Canvas/SVG) 및 예매

### 목표

- 좌석 맵 UI 구현 (Canvas/SVG)
- 좌석 선택 및 HOLD 기능
- 실시간 좌석 상태 갱신

### 작업 내용

- [ ] 좌석 맵 컴포넌트 구현:
  - [ ] Canvas 또는 SVG 선택
  - [ ] 좌석 배치 렌더링
  - [ ] 좌석 상태별 시각적 구분 (AVAILABLE, HOLD, PAYMENT_PENDING, RESERVED, CANCELLED, BLOCKED, DISABLED)
- [ ] 좌석 선택 기능:
  - [ ] 좌석 클릭 이벤트 처리
  - [ ] 다중 좌석 선택
  - [ ] 선택 좌석 표시
- [ ] 좌석 HOLD API 연동:
  - [ ] 좌석 클릭 → HOLD 요청
  - [ ] HOLD Token 저장
  - [ ] 응답 시간 < 200ms 목표
- [ ] HOLD 타이머 표시:
  - [ ] 서버 기준 시간 사용
  - [ ] 타이머 UI 구현
- [ ] 실시간 좌석 갱신 연동:
  - [ ] WebSocket/SSE 클라이언트 구현
  - [ ] 좌석 상태 변경 시 UI 업데이트
  - [ ] Optimistic UI 및 롤백 로직
- [ ] 좌석 선택 페이지 전체 플로우 구현
- [ ] 에러 처리 및 사용자 피드백

### 체크리스트

- [ ] Canvas/SVG 렌더링 사용 확인
- [ ] 좌석 상태별 시각적 명확 분리 확인
- [ ] HOLD 타이머는 서버 기준 시간 사용 확인
- [ ] 좌석 클릭 반응 속도 < 200ms 확인
- [ ] 실시간 좌석 갱신 정상 동작 확인
- [ ] Optimistic UI 롤백 로직 확인
- [ ] 새로고침 없이 좌석 갱신 확인

### 예상 소요 시간

5-6일

---

## Step 11: 사용자 웹 (React) - 결제 페이지

### 목표

- 결제 페이지 UI 구현
- 결제 플로우 구현
- UX 안정성 확보

### 작업 내용

- [ ] 결제 페이지 레이아웃 구현
- [ ] 예매 정보 표시:
  - [ ] 영화 정보
  - [ ] 상영 정보
  - [ ] 좌석 정보
  - [ ] 가격 정보 (서버에서 받은 값만 표시)
- [ ] 결제 정보 입력 UI (Mock):
  - [ ] 결제 수단 선택
  - [ ] 결제 정보 입력 폼
- [ ] 결제 API 연동:
  - [ ] HOLD Token 전달
  - [ ] 결제 요청
  - [ ] 결제 성공/실패 처리
- [ ] 결제 실패 처리:
  - [ ] 에러 메시지 표시
  - [ ] 재시도 옵션 제공
- [ ] 결제 완료 페이지:
  - [ ] 예매 확인 정보
  - [ ] 예매 번호 표시
- [ ] 로딩 상태 처리
- [ ] UX 개선 (로딩, 애니메이션 등)

### 체크리스트

- [ ] 결제 페이지 UX 안정성 확인
- [ ] 가격 정보는 서버에서 받은 값만 표시 확인
- [ ] 결제 실패 시 재시도 옵션 제공 확인
- [ ] HOLD Token 검증 확인
- [ ] 결제 플로우 정상 동작 확인

### 예상 소요 시간

2-3일

---

## Step 12: 관리자 웹 (React) - 기본 구조 및 인증

### 목표

- 관리자 웹 프로젝트 초기 설정
- 관리자 인증/인가 구현
- 기본 레이아웃 구성

### 작업 내용

- [ ] 관리자 웹 프로젝트 생성 (별도 또는 통합)
- [ ] 관리자 라우팅 설정 (`/admin/**`)
- [ ] 관리자 인증 구현:
  - [ ] 관리자 로그인 페이지
  - [ ] JWT 토큰 관리
  - [ ] Role 기반 접근 제어
- [ ] 관리자 레이아웃 구현:
  - [ ] 사이드바 네비게이션
  - [ ] 헤더
  - [ ] 컨텐츠 영역
- [ ] 관리자 API 클라이언트 설정
- [ ] 인증 실패 시 리다이렉트 처리

### 체크리스트

- [ ] 관리자 API 인증/권한 검사 확인
- [ ] 일반 사용자는 관리자 페이지 접근 불가 확인
- [ ] 관리자 레이아웃 정상 동작 확인

### 예상 소요 시간

2-3일

---

## Step 13: 관리자 웹 (React) - 영화/상영관 관리

### 목표

- 영화 관리 UI 구현
- 상영관 관리 UI 구현
- 상영 스케줄 관리 UI 구현

### 작업 내용

- [ ] 영화 관리 페이지:
  - [ ] 영화 목록 조회
  - [ ] 영화 등록 폼
  - [ ] 영화 수정 폼
  - [ ] 영화 삭제 기능
- [ ] 상영관 관리 페이지:
  - [ ] 상영관 목록 조회
  - [ ] 상영관 등록 폼
  - [ ] 상영관 수정 폼
  - [ ] 상영관 삭제 기능
- [ ] 상영 스케줄 관리 페이지:
  - [ ] 상영 스케줄 목록 조회
  - [ ] 상영 스케줄 등록 폼
  - [ ] 상영 스케줄 수정 폼
  - [ ] 상영 스케줄 삭제 기능
- [ ] 가격 정책 관리 페이지:
  - [ ] 시간대별 가격 설정
  - [ ] 좌석 등급별 가격 설정
- [ ] 좌석 배치 설정 페이지:
  - [ ] 상영관별 좌석 배치 설정
  - [ ] 좌석 타입 설정
  - [ ] 좌석 상태 관리 (BLOCKED, DISABLED 설정)
- [ ] CRUD 기능 API 연동
- [ ] 폼 검증 및 에러 처리

### 체크리스트

- [ ] 영화 관리 기능 정상 동작 확인
- [ ] 상영관 관리 기능 정상 동작 확인
- [ ] 상영 스케줄 관리 기능 정상 동작 확인
- [ ] 가격 정책 관리 기능 정상 동작 확인
- [ ] 좌석 배치 설정 기능 정상 동작 확인
- [ ] 좌석 상태 관리 (BLOCKED, DISABLED) 기능 정상 동작 확인

### 예상 소요 시간

4-5일

---

## Step 14: 관리자 웹 (React) - 예매/결제 조회

### 목표

- 예매 내역 조회 UI
- 결제 내역 조회 UI
- 취소 내역 조회 UI

### 작업 내용

- [ ] 예매 내역 조회 페이지:
  - [ ] 예매 목록 조회
  - [ ] 필터링 기능 (날짜, 영화, 사용자 등)
  - [ ] 정렬 기능
  - [ ] 페이지네이션
  - [ ] 예매 상세 정보 모달
- [ ] 결제 내역 조회 페이지:
  - [ ] 결제 목록 조회
  - [ ] 필터링 기능
  - [ ] 결제 상세 정보
- [ ] 취소 내역 조회 페이지:
  - [ ] 취소 목록 조회
  - [ ] 취소 사유 표시
- [ ] 통계 대시보드 (선택사항):
  - [ ] 일별 예매 통계
  - [ ] 영화별 예매 통계
- [ ] 데이터 시각화 (차트 등, 선택사항)

### 체크리스트

- [ ] 예매 내역 조회 정상 동작 확인
- [ ] 결제 내역 조회 정상 동작 확인
- [ ] 취소 내역 조회 정상 동작 확인
- [ ] 필터링/정렬 기능 정상 동작 확인

### 예상 소요 시간

2-3일

---

## Step 15: 모바일 앱 (Flutter) - 핵심 플로우 구현

### 목표

- Flutter 프로젝트 초기 설정
- 사용자 핵심 기능 구현
- 상태 관리 및 API 연동

### 작업 내용

- [ ] Flutter 프로젝트 생성
- [ ] 프로젝트 구조 설정
- [ ] 상태 관리 설정 (flutter_riverpod)
- [ ] API 클라이언트 설정
- [ ] 로깅 설정 (logger)
- [ ] 다국어 및 날짜 포맷팅 설정 (intl)
- [ ] 인증 플로우 구현:
  - [ ] 로그인 화면
  - [ ] 회원 가입 화면
  - [ ] JWT 토큰 관리
- [ ] 영화 목록 화면:
  - [ ] 영화 목록 조회
  - [ ] 영화 상세 정보
  - [ ] 상영 시간표 조회
- [ ] 좌석 선택 화면:
  - [ ] 좌석 맵 UI
  - [ ] 좌석 선택 기능
  - [ ] HOLD 기능
  - [ ] 실시간 좌석 갱신 (WebSocket/SSE)
- [ ] 결제 화면:
  - [ ] 예매 정보 표시
  - [ ] 결제 처리
  - [ ] 결제 완료 화면
- [ ] 예매 내역 화면:
  - [ ] 예매 목록 조회
  - [ ] 예매 상세 정보

### 체크리스트

- [ ] flutter_riverpod 상태 관리 사용 확인
- [ ] logger, intl 라이브러리 사용 확인
- [ ] 서버 상태는 서버 기준 확인
- [ ] HOLD 타이머는 서버 기준 시간 사용 확인
- [ ] 실시간 좌석 갱신 정상 동작 확인
- [ ] 핵심 플로우 정상 동작 확인

### 예상 소요 시간

5-6일

---

## Step 16: API Rate Limit 및 보안 강화

### 목표

- API Rate Limit 구현
- 보안 취약점 점검 및 보완
- 로깅 강화

### 작업 내용

- [ ] API Rate Limit 구현:
  - [ ] 예매 API Rate Limit
  - [ ] 관리자 API 별도 Rate Limit
  - [ ] Redis 기반 Rate Limit
- [ ] 보안 강화:
  - [ ] HOLD Token 검증 강화
  - [ ] 결제 위변조 방지 검증 강화
  - [ ] 입력값 검증 강화
  - [ ] SQL Injection 방지 확인
  - [ ] XSS 방지 확인
- [ ] 로깅 강화:
  - [ ] 필수 로그 구현 (HOLD/해제, 결제 성공/실패, 락 획득 실패)
  - [ ] 개인정보 로그 금지 확인
  - [ ] 결제 상세 정보 로그 금지 확인
  - [ ] JWT Token 마스킹 처리
- [ ] 에러 메시지 보안 (민감 정보 노출 방지)

### 체크리스트

- [ ] 예매 API Rate Limit 적용 확인
- [ ] 관리자 API 별도 Rate Limit 적용 확인
- [ ] HOLD Token 검증 확인
- [ ] 필수 로그 구현 확인
- [ ] 개인정보 로그 금지 확인
- [ ] 보안 취약점 점검 완료

### 예상 소요 시간

2-3일

---

## Step 17: 장애 대응 및 복구 로직 구현

### 목표

- Redis 장애 대응 로직 구현
- 자동 복구 메커니즘 구현
- 상태 동기화 작업 구현

### 작업 내용

- [ ] Redis 장애 감지 로직:
  - [ ] Health Check 구현
  - [ ] 장애 감지 시 DB Fallback 전환
- [ ] DB Fallback 로직 강화:
  - [ ] 읽기: DB Fallback
  - [ ] 쓰기: 예매 차단 (Fail Fast)
- [ ] 자동 복구 로직:
  - [ ] HOLD 타임아웃 자동 해제 스케줄러
  - [ ] 트랜잭션 롤백 처리
  - [ ] 상태 동기화 작업 (Redis ↔ DB)
- [ ] 모니터링 및 알림:
  - [ ] 장애 발생 시 알림
  - [ ] 로그 모니터링
- [ ] 복구 테스트:
  - [ ] Redis 장애 시나리오 테스트
  - [ ] 복구 프로세스 테스트

### 체크리스트

- [ ] Redis 장애 시 DB Fallback 동작 확인
- [ ] HOLD 타임아웃 자동 해제 동작 확인
- [ ] 상태 동기화 작업 정상 동작 확인
- [ ] 장애 복구 프로세스 확인

### 예상 소요 시간

3-4일

---

## Step 18: 테스트 작성 및 커버리지 확보

### 목표

- 핵심 비즈니스 로직 테스트 작성
- 통합 테스트 작성
- 테스트 커버리지 확보

### 작업 내용

- [ ] 단위 테스트 작성:
  - [ ] Domain 로직 테스트
  - [ ] Service 로직 테스트
  - [ ] 좌석 HOLD 로직 테스트
  - [ ] 결제 로직 테스트
- [ ] 통합 테스트 작성:
  - [ ] API 통합 테스트
  - [ ] Redis 통합 테스트
  - [ ] DB 통합 테스트
- [ ] 동시성 테스트:
  - [ ] 분산 락 테스트
  - [ ] 중복 예매 방지 테스트
  - [ ] HOLD 충돌 방지 테스트
- [ ] 테스트 커버리지 측정:
  - [ ] 핵심 로직 80% 이상 목표
  - [ ] 좌석/결제 로직 100% 목표
- [ ] 테스트 자동화 설정 (CI/CD)

### 체크리스트

- [ ] 좌석/결제 로직 테스트 커버리지 100% 확인
- [ ] 핵심 로직 테스트 커버리지 80% 이상 확인
- [ ] 동시성 테스트 통과 확인
- [ ] 통합 테스트 정상 동작 확인

### 예상 소요 시간

4-5일

---

## Step 19: 부하 테스트 및 성능 최적화

### 목표

- 부하 테스트 수행
- 성능 목표 달성 확인
- 성능 최적화

### 작업 내용

- [ ] 부하 테스트 도구 설정 (nGrinder/JMeter):
  - [ ] 테스트 시나리오 작성
  - [ ] 동시 접속자 1000명 시나리오
  - [ ] 좌석 클릭 TPS 1000 시나리오
- [ ] 부하 테스트 수행:
  - [ ] 일반 조회 API 테스트
  - [ ] 좌석 HOLD API 테스트
  - [ ] 결제 API 테스트
- [ ] 성능 목표 확인:
  - [ ] 좌석 클릭 → 반영 < 200ms 확인
  - [ ] 최대 1000 TPS 지원 확인
- [ ] 성능 병목 지점 분석:
  - [ ] DB 쿼리 최적화
  - [ ] Redis 최적화
  - [ ] API 응답 시간 최적화
- [ ] 성능 최적화 적용:
  - [ ] 인덱스 추가
  - [ ] 쿼리 최적화
  - [ ] 캐싱 전략 개선
- [ ] 재테스트 및 검증

### 체크리스트

- [ ] 좌석 클릭 → 반영 < 200ms 달성 확인
- [ ] 최대 1000 TPS 지원 확인
- [ ] 동시 접속자 1000명 처리 확인
- [ ] 성능 목표 달성 확인

### 예상 소요 시간

3-4일

---

## Step 20: 배포 준비 및 CI/CD 설정

### 목표

- 프로덕션 배포 준비
- CI/CD 파이프라인 구축
- 문서화 완료

### 작업 내용

- [ ] 프로덕션 환경 설정:
  - [ ] 환경 변수 설정
  - [ ] 프로덕션 DB 설정
  - [ ] 프로덕션 Redis 설정
- [ ] Docker 이미지 빌드:
  - [ ] Spring Boot 애플리케이션 이미지
  - [ ] Nginx 이미지
  - [ ] Docker Compose 프로덕션 설정
- [ ] CI/CD 파이프라인 구축 (GitHub Actions):
  - [ ] 자동 빌드
  - [ ] 자동 테스트 실행
  - [ ] 자동 배포 (선택사항)
- [ ] 문서화:
  - [ ] API 문서 (Swagger/OpenAPI)
  - [ ] 배포 가이드
  - [ ] 운영 가이드
- [ ] 모니터링 설정:
  - [ ] 로그 수집
  - [ ] 메트릭 수집
  - [ ] 알림 설정
- [ ] 최종 점검:
  - [ ] 모든 기능 동작 확인
  - [ ] 성능 목표 달성 확인
  - [ ] 보안 점검 완료

### 체크리스트

- [ ] CI/CD 파이프라인 정상 동작 확인
- [ ] 프로덕션 배포 준비 완료 확인
- [ ] API 문서 작성 완료 확인
- [ ] 배포 가이드 작성 완료 확인
- [ ] 모니터링 설정 완료 확인
- [ ] 최종 점검 완료 확인

### 예상 소요 시간

3-4일

---

## 전체 일정 요약

| Step | 작업 내용 | 예상 소요 시간 |
|------|----------|--------------|
| 1 | 프로젝트 생성 및 환경 설정 | 1-2일 |
| 2 | Spring Boot 기본 세팅 및 엔티티 설계 | 2-3일 |
| 3 | 회원 도메인 및 JWT 인증/인가 | 3-4일 |
| 4 | 영화/상영관(Admin) 도메인 API | 4-5일 |
| 5 | 좌석 배치 및 조회 (Redis 캐싱) | 2-3일 |
| 6 | 좌석 선점(HOLD) 및 분산 락 | 4-5일 |
| 7 | 예매 및 결제 트랜잭션 | 4-5일 |
| 8 | 실시간 좌석 갱신 (WebSocket/SSE) | 3-4일 |
| 9 | 사용자 웹 - 메인 및 영화 목록 | 3-4일 |
| 10 | 사용자 웹 - 좌석 선택 및 예매 | 5-6일 |
| 11 | 사용자 웹 - 결제 페이지 | 2-3일 |
| 12 | 관리자 웹 - 기본 구조 및 인증 | 2-3일 |
| 13 | 관리자 웹 - 영화/상영관 관리 | 4-5일 |
| 14 | 관리자 웹 - 예매/결제 조회 | 2-3일 |
| 15 | 모바일 앱 - 핵심 플로우 | 5-6일 |
| 16 | API Rate Limit 및 보안 강화 | 2-3일 |
| 17 | 장애 대응 및 복구 로직 | 3-4일 |
| 18 | 테스트 작성 및 커버리지 확보 | 4-5일 |
| 19 | 부하 테스트 및 성능 최적화 | 3-4일 |
| 20 | 배포 준비 및 CI/CD 설정 | 3-4일 |
| **총계** | | **약 60-80일** |

---

## 주의사항

1. **순차적 진행**: 각 Step은 이전 Step의 완료를 전제로 합니다.
2. **RULE.md 준수**: 모든 개발 작업은 RULE.md의 규칙을 준수해야 합니다.
3. **코드 리뷰**: 각 Step 완료 후 코드 리뷰를 진행하고 체크리스트를 확인합니다.
4. **테스트 우선**: 핵심 로직은 반드시 테스트를 작성한 후 배포합니다.
5. **문서화**: 각 Step 완료 시 관련 문서를 업데이트합니다.

---

## 참고사항

- 본 작업 계획은 PRD.md와 RULE.md를 기반으로 작성되었습니다.
- 프로젝트 진행 중 필요에 따라 작업 내용이 변경될 수 있습니다.
- 각 Step의 예상 소요 시간은 팀 규모와 경험에 따라 달라질 수 있습니다.
- 병렬 작업이 가능한 Step은 팀 구성에 따라 동시 진행할 수 있습니다.
