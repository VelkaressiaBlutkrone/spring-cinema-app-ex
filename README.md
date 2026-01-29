# Spring Cinema App Ex (영화관 예매 시스템)

## 📖 프로젝트 개요

본 프로젝트는 멀티플렉스 영화관의 **고성능 실시간 좌석 예매 시스템**입니다. Spring Boot 백엔드와 React 웹 프론트엔드, Flutter 모바일 앱으로 구성되어 있으며, 도메인 주도 설계(DDD) 원칙을 기반으로 설계되었습니다.

### 🎯 핵심 목표

- **동시 접속자 1,000명** 지원
- **좌석 클릭 TPS 1,000** 처리
- **좌석 클릭 반응 시간 < 200ms**
- **중복 예매 0%** 보장

---

## 🏗️ 프로젝트 아키텍처 구조

시스템은 도메인 주도 설계(DDD) 원칙을 따르며, 다음과 같은 구조로 구성되어 있습니다.

| 구분 | 기술 스택 |
|------|----------|
| **Backend** | Spring Boot 4.0.2 (Layered Architecture: Controller → Service → Domain → Infrastructure) |
| **Frontend (Web)** | React 18, TypeScript, Vite (SPA) |
| **Frontend (Mobile)** | Flutter, Riverpod (MVVM) |
| **Database** | MySQL 8.0 (Production), H2 (Development) |
| **Cache & Lock** | Redis (Caching, Distributed Locks, Session) |
| **Infrastructure** | Docker, Nginx |

---

## 💻 프로젝트 기술구성

### Backend

| 항목 | 기술 |
|------|------|
| **Language** | Java 21 |
| **Framework** | Spring Boot 4.0.2 |
| **Data** | Spring Data JPA, QueryDSL |
| **Security** | Spring Security, JWT + Refresh Token |
| **Cache** | Redis (Redisson Client) |
| **Build Tool** | Gradle |

### Frontend (Web)

| 항목 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Framework** | React 18 |
| **Build Tool** | Vite |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS |
| **Package Manager** | npm |

### Infrastructure & DB

- MySQL 8.0, H2 Database
- Redis (Redisson Client)
- Docker, Nginx

---

## 📁 도메인 패키지 구조

```
domain/
├── member/           # 회원 도메인
│   ├── entity/       Member, MemberStatus, MemberRole
│   ├── repository/   MemberRepository
│   ├── controller/   MemberController
│   ├── service/      MemberService
│   └── dto/
├── movie/            # 영화 도메인
│   ├── entity/       Movie, MovieStatus
│   ├── repository/   MovieRepository
│   └── service/      
├── theater/          # 영화관 도메인
│   ├── entity/       Theater, TheaterStatus
│   └── repository/   TheaterRepository
├── screening/        # 상영 도메인 (Aggregate Root)
│   ├── entity/       Screening, Screen, Seat, ScreeningSeat
│   │                 ScreeningStatus, ScreenStatus, ScreenType
│   │                 SeatStatus, SeatType, SeatBaseStatus
│   ├── repository/   ScreeningRepository, ScreenRepository, SeatRepository
│   └── controller/   ScreeningController
├── reservation/      # 예매 도메인
│   ├── entity/       Reservation, ReservationSeat, ReservationStatus
│   └── repository/   ReservationRepository
└── payment/          # 결제 도메인
    ├── entity/       Payment, PaymentStatus, PaymentMethod
    └── repository/   PaymentRepository
```

---

## ⚡ 주요기능

### 1. 사용자 기능

#### 🔐 회원 관리
- JWT + Refresh Token 기반 인증/인가
- 회원 가입, 로그인, 로그아웃
- Access Token 유효시간 15분, Refresh Token Redis 저장 (TTL 7일)

#### 🎬 영화 및 상영 일정 조회
- 영화 목록 및 상세 정보 조회
- 날짜별 상영 시간표 조회
- 3일 이내 상영 예정 영화 목록

#### 🎫 실시간 좌석 예매
- **Redis 분산 락**을 통한 중복 예매 방지
- 좌석 선택 시 **임시 점유(HOLD)** - TTL 5~10분
- **SSE(Server-Sent Events)**를 이용한 실시간 좌석 상태 반영
- 좌석 상태: `AVAILABLE` → `HOLD` → `PAYMENT_PENDING` → `RESERVED`
- HOLD 타임아웃 자동 해제 스케줄러

#### 💳 결제 시스템 (Mock)
- 결제 대기, 완료, 취소 상태 관리
- 결제 실패 시 좌석 자동 반환
- 지원 결제 수단: CARD, KAKAO_PAY, NAVER_PAY, TOSS, BANK_TRANSFER

### 2. 관리자 기능

#### 📊 대시보드
- KPI 카드 (오늘 매출, 예매 건수, 좌석 점유율)
- 일별 매출/예매 추이 차트 (최근 30일)
- 오늘 상영 영화 TOP5 예매 순위

#### 🎥 콘텐츠 관리
- 영화 등록/수정/삭제
- 영화관 및 상영관 관리
- 상영 스케줄 등록/수정 (시간 중복 검증)
- 좌석 배치도 설정 (좌석 타입: NORMAL, PREMIUM, VIP, COUPLE, WHEELCHAIR)

#### 📋 예매/결제 조회
- 예매 내역 조회 (필터링: 날짜, 영화, 사용자, 상태)
- 결제 내역 조회
- 취소 내역 조회

---

## 🔌 주요 API 엔드포인트

### 회원 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/members/signup` | 회원 가입 |
| POST | `/api/members/login` | 로그인 |
| POST | `/api/members/refresh` | 토큰 갱신 |
| POST | `/api/members/logout` | 로그아웃 |

### 영화/상영 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/movies` | 영화 목록 조회 |
| GET | `/api/movies/{movieId}` | 영화 상세 조회 |
| GET | `/api/screenings/{screeningId}/seats` | 좌석 배치 조회 |
| GET | `/api/screenings/{screeningId}/seat-events` | SSE 좌석 실시간 이벤트 |

### 예매 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/screenings/{screeningId}/seats/{seatId}/hold` | 좌석 HOLD |
| POST | `/api/screenings/holds/release` | HOLD 해제 |
| POST | `/api/reservations/pay` | 결제(예매) 요청 |
| GET | `/api/reservations` | 본인 예매 목록 |
| POST | `/api/reservations/{reservationId}/cancel` | 예매 취소 |

### 관리자 API (`/api/admin/**`)
- 영화/영화관/상영관/상영스케줄/좌석 CRUD
- 예매/결제 내역 조회
- 통계 대시보드 API

---

## 📂 프로젝트 주요설정 파일

| 파일 | 설명 |
|------|------|
| `build.gradle` | 백엔드 프로젝트 의존성 및 빌드 설정 (Java 21, Spring Boot 4.0.2) |
| `settings.gradle` | Gradle 프로젝트 구조 설정 |
| `front_end/vite.config.ts` | 프론트엔드 Vite 빌드 및 Alias 설정 |
| `front_end/package.json` | 프론트엔드 라이브러리 의존성 관리 |
| `front_end/tailwind.config.js` | Tailwind CSS 설정 |
| `src/main/resources/application.yml` | DB 연결, Redis 설정, 로깅 등 백엔드 환경 설정 |

---

## 🚀 프로젝트 실행방법

### 1. 사전 요구사항 (Prerequisites)

- Java 21 Development Kit (JDK 21)
- Node.js 18 이상
- Redis Server (기본 포트 6379)

### 2. 백엔드 실행 (Backend)

프로젝트 루트 디렉토리에서 실행합니다.

```bash
# Gradle 빌드 및 실행
./gradlew clean build
./gradlew bootRun
```

### 3. 프론트엔드 실행 (Frontend)

`front_end` 디렉토리로 이동하여 실행합니다.

```bash
cd front_end

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. Docker 환경 실행 (선택)

```bash
docker-compose up -d
```

---

## 🛡️ 보안 및 동시성 제어

### 보안
- JWT + Refresh Token 인증
- API Rate Limit 적용
- Redis 기반 세션 보호
- HOLD Token 검증
- 관리자 Role 기반 접근 제어 (`@PreAuthorize("hasRole('ADMIN')")`)

### 동시성 제어
- **Redisson 분산 락**: `lock:screening:{screeningId}:seat:{seatId}`
- **Redis 캐싱**: `seat:status:{screeningId}` (TTL 5분)
- **HOLD 관리**: `seat:hold:{screeningId}:{seatId}` (TTL 5~10분)
- Redis 장애 시 DB Fallback 지원

---

## 📚 프로젝트 문서링크

프로젝트에 대한 상세 문서는 `doc/` 디렉토리에 위치합니다.

| 문서 | 설명 |
|------|------|
| [📋 PRD.md](doc/PRD.md) | 제품 요구사항 문서 |
| [🏛️ ARCHITECTURE.md](doc/ARCHITECTURE.md) | 전체 아키텍처 |
| [⚙️ ARCHITECTURE_BACKEND.md](doc/ARCHITECTURE_BACKEND.md) | 백엔드 아키텍처 |
| [📝 TASK.md](doc/TASK.md) | 개발 작업 계획 |
| [📖 RULE.md](doc/RULE.md) | 개발 규칙 |
| [🔧 trouble/](doc/trouble/) | 문제 해결 가이드 |

---

## 🔗 참고 문서링크

- [Spring Boot Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Redis Documentation](https://redis.io/docs/)

---

## 📄 라이센스

MIT License

---

## ⚠️ 기타 주의점

- **Java 버전:** 본 프로젝트는 Java 21 기능을 사용하므로 반드시 JDK 21이 설치되어 있어야 합니다.
- **Spring Boot Repository:** Spring Boot 4.0.2 버전 사용을 위해 `build.gradle`에 Spring Milestone Repository(`https://repo.spring.io/milestone`) 설정이 포함되어 있습니다.
- **Redis 의존성:** 로컬 개발 시에도 Redis 서버가 실행 중이어야 좌석 예매 및 락 기능이 정상 작동합니다.
- **프론트엔드 빌드:** 프론트엔드 빌드 관련 오류 발생 시 `doc/trouble/05-build.md`를 참고하여 캐시 정리 및 의존성 재설치를 진행하세요.