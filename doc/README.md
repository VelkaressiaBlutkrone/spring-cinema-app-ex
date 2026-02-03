# 영화관 예매 시스템 문서 (Cinema Reservation System Documentation)

본 디렉토리는 영화관 예매 시스템 프로젝트의 모든 설계 문서, 개발 가이드 및 참고 자료를 포함하고 있습니다.

## 📚 문서 목차 (Table of Contents)

### 1. 프로젝트 기획 및 요구사항

#### [PRD.md](./PRD.md) - Product Requirements Document

영화관 예매 시스템의 제품 요구사항 문서입니다.

**주요 내용:**

- 프로젝트 개요 및 목표
- 서비스 성격 정의 (멀티플렉스, 회원 필수, 실시간 예매)
- 성능 목표 (동시 접속자 1000명, 좌석 클릭 TPS 1000, 응답 시간 < 200ms)
- 사용자 및 관리자 기능 요구사항
- 기술 스택 (Spring Boot, React, Flutter, MySQL, Redis)
- 핵심 질문 및 답변 (최대 동시 예매 수, HOLD 시간, 장애 처리 등)
- 비기능 요구사항 (보안, 가용성, 동시성)

**대상 독자:** 프로젝트 관리자, 개발팀, 기획팀

---

#### [RULE.md](./RULE.md) - Development Rules

프로젝트 개발 규칙 및 아키텍처 원칙입니다.

**주요 내용:**

- 절대 원칙 (좌석 상태 변경 제어, 데이터 저장소 역할 분리)
- 아키텍처 레이어 규칙 (Controller → Service → Domain → Infrastructure)
- Domain 규칙 (Aggregate, 좌석 소속, 가격 계산)
- 좌석 상태 관리 규칙 (7가지 상태: AVAILABLE, HOLD, PAYMENT_PENDING, RESERVED, CANCELLED, BLOCKED, DISABLED)
- HOLD 규칙 (Redis + TTL, HOLD Token 발급 및 검증)
- 분산 락 규칙 (Redisson)
- 트랜잭션 규칙
- 실시간 좌석 갱신 규칙 (WebSocket/SSE)
- Redis 사용 규칙 (Key 네이밍, TTL)
- 보안 규칙 (JWT, Rate Limit, HOLD Token 검증)
- 코드 리뷰 체크리스트

**대상 독자:** 개발팀 (필수 숙지)

---

#### [TASK.md](./TASK.md) - Task Plan

상세 개발 작업 계획 및 일정입니다.

**주요 내용:**

- 20개의 개발 Step (Step 1: 프로젝트 생성 ~ Step 20: 배포 준비)
- 각 Step별 목표, 작업 내용, 체크리스트
- 예상 소요 시간 및 전체 일정 요약 (약 60-80일)
- Step 1-2: 환경 설정 및 엔티티 설계 (완료)
- Step 3-8: 백엔드 핵심 기능 (회원, 관리자, 좌석, 예매, 결제, 실시간 갱신)
- Step 9-14: 프론트엔드 (React 웹)
- Step 15: 모바일 앱 (Flutter)
- Step 16-20: 보안, 장애 대응, 테스트, 성능 최적화, 배포

**대상 독자:** 프로젝트 관리자, 개발팀

---

### 2. 아키텍처 설계

#### [ARCHITECTURE_ALL.md](./ARCHITECTURE_ALL.md) - 전체 시스템 아키텍처

영화관 예매 시스템의 전체 시스템 아키텍처를 설명합니다.

**주요 내용:**

- 시스템 컨테이너 다이어그램 (C4 Model)
- 기술 스택 요약 (Backend, Frontend, Database, Cache, Infrastructure)
- 핵심 데이터 흐름 (조회, 좌석 선점, 결제 및 예매 확정, 실시간 갱신)
- 시스템 구성 요소 간 상호작용

**대상 독자:** 아키텍트, 개발팀, 기술 리더

---

#### [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md) - 백엔드 아키텍처

백엔드 시스템의 상세 아키텍처를 설명합니다.

**주요 내용:**

- 도메인 모델 (ERD)
- 좌석 상태 머신 (State Machine)
- 핵심 로직: 좌석 예매 시퀀스 (Sequence Diagram)
- 패키지 구조 (DDD 기반)
- 주요 도메인: Member, Movie, Theater, Screening (Aggregate Root), Reservation, Payment

**대상 독자:** 백엔드 개발자, 아키텍트

---

#### [ARCHITECTURE_FRONTEND.md](./ARCHITECTURE_FRONTEND.md) - 프론트엔드 아키텍처

React 웹 애플리케이션의 아키텍처를 설명합니다.

**주요 내용:**

- 기술 스택 (React, TypeScript, Vite, Zustand, Axios)
- 라우팅 구조 (사용자/관리자 영역)
- 디렉터리 구조, API 레이어
- 인증 흐름 (JWT, Refresh Token)
- 공통 컴포넌트, 예매 플로우
- 실시간 좌석 갱신 (useSeatEvents)
- 테마, 로깅

**대상 독자:** 프론트엔드 개발자 (React/TypeScript)

---

#### [ARCHITECTURE_MOBILE.md](./ARCHITECTURE_MOBILE.md) - 모바일 아키텍처

Flutter 모바일 앱의 아키텍처를 설명합니다.

**주요 내용:**

- 앱 네비게이션 구조
- 아키텍처 패턴 (Riverpod + MVVM)
- 주요 기술적 고려사항 (상태 관리, 네트워크, 좌석 맵 렌더링, 실시간 통신)

**대상 독자:** 모바일 개발자 (Flutter)

---

### 3. 재사용 모듈 가이드

#### [BACKEND_MODULES.md](./BACKEND_MODULES.md) - 백엔드 재사용 모듈

백엔드 프로젝트에서 재사용 가능한 모듈들을 정리한 문서입니다.

**주요 내용:**

- 전역 설정 (CorsConfig, SecurityConfig, QueryDslConfig, GsonConfig)
- AOP 로깅 (@Logging 어노테이션, LoggingAspect, ControllerLoggingAspect)
- 예외 처리 체계 (ErrorCode, BusinessException, ErrorResponse, GlobalExceptionHandler)
- 기본 엔티티 (BaseTimeEntity)
- DTO 패턴 (내부 정적 클래스 패턴)
- 의존성 요구사항

**대상 독자:** 백엔드 개발자 (재사용 모듈 활용 시)

---

#### [FRONTEND_MODULES.md](./FRONTEND_MODULES.md) - 프론트엔드 재사용 모듈

프론트엔드 프로젝트에서 재사용 가능한 모듈들을 정리한 문서입니다.

**주요 내용:**

- 공통 컴포넌트 (Modal, ConfirmDialog, Toast, LoadingSpinner, EmptyState, Pagination)
- 유틸리티 함수 (dateUtils, formatters, errorHandler)
- 커스텀 훅 (useToast)
- 타입 정의 (common.types, product.types, changeLog.types)
- 재사용 가이드라인

**대상 독자:** 프론트엔드 개발자 (React/TypeScript)

---

#### [MOBILE_MODULES.md](./MOBILE_MODULES.md) - 모바일 재사용 모듈

모바일 앱에서 재사용 가능한 모듈들을 정리한 문서입니다.

**대상 독자:** 모바일 개발자 (Flutter)

---

### 4. 개발 가이드

#### [DEVELOPMENT_ENVIRONMENT.md](./DEVELOPMENT_ENVIRONMENT.md) - 개발환경 세팅 가이드

개발환경 설정을 위한 종합 가이드입니다.

**주요 내용:**

- Java 21, Spring Boot 4.0.2, Gradle 9.1.0 설치 및 경로 설정
- Node.js, npm, React, TypeScript, Vite 버전 및 설치 방법
- Dart, Flutter 모바일 개발 환경
- MySQL, Redis, Docker 인프라 설정
- 환경 변수 및 PATH 설정 (Windows/macOS/Linux)
- IDE 권장 설정 및 인코딩
- 환경 검증 체크리스트

**대상 독자:** 신규 개발자, DevOps, 프로젝트 온보딩

---

#### [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker 앱 환경 설정 가이드

MySQL, Redis를 제외한 백엔드/프론트엔드/모바일 애플리케이션을 Docker로 실행하는 설정 가이드입니다.

**주요 내용:**

- Backend, Frontend, Mobile Dockerfile 및 docker-compose 프로파일
- 프로파일별 실행 방법 (backend, frontend, mobile, app)
- 포트, 접속 정보, 환경 변수
- 빌드, 로그, 문제 해결

**대상 독자:** Docker 기반 로컬/통합 테스트 환경 구축 시 참고

---

#### [SERVER_STARTUP_GUIDE.md](./SERVER_STARTUP_GUIDE.md) - 서버 구동 가이드

서버 구동 및 연결 상태 확인 가이드입니다.

**주요 내용:**

- 프로파일별 데이터베이스 설정
  - 개발 환경 (dev): H2 인메모리 데이터베이스
  - 운영 환경 (prod): MySQL 데이터베이스
- DB 접속 여부와 상관없이 서버 구동하는 방법
  - application.yml 설정 (HikariCP, JPA/Hibernate, Redis)
  - MySQL 연결 URL 파라미터
  - 주의사항 (개발/테스트 환경에서만 사용)
- 서버 접속 로깅 (DatabaseConnectionChecker)
  - 데이터베이스(H2/MySQL)/Redis 연결 상태 체크
  - 출력 예시 (연결 성공/실패)

**대상 독자:** 백엔드 개발자, DevOps

---

#### [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 해결 가이드

프로젝트 개발 중 발생하는 문제와 해결 방법을 정리한 문서입니다.

**주요 내용:**

- 일반적인 문제 해결 절차
- TypeScript/React 관련 문제 (JSX 태그 에러, node_modules 설치 등)
- Spring Boot/백엔드 관련 문제
- 빌드 관련 문제
- 데이터베이스 관련 문제
- CORS 관련 문제
- 포트 충돌 문제
- 설정 가이드
- 문제 해결 이력

**대상 독자:** 전체 개발팀

---

## 📖 문서 읽기 순서 권장

### 신규 팀원 온보딩

1. [PRD.md](./PRD.md) - 프로젝트 개요 및 요구사항 이해
2. [RULE.md](./RULE.md) - 개발 규칙 숙지 (필수)
3. [ARCHITECTURE_ALL.md](./ARCHITECTURE_ALL.md) - 전체 시스템 아키텍처 파악
4. 역할별 상세 문서:
   - 백엔드: [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md) → [BACKEND_MODULES.md](./BACKEND_MODULES.md)
   - 프론트엔드: [ARCHITECTURE_FRONTEND.md](./ARCHITECTURE_FRONTEND.md) → [FRONTEND_MODULES.md](./FRONTEND_MODULES.md)
   - 모바일: [ARCHITECTURE_MOBILE.md](./ARCHITECTURE_MOBILE.md) → [MOBILE_MODULES.md](./MOBILE_MODULES.md)
5. [DEVELOPMENT_ENVIRONMENT.md](./DEVELOPMENT_ENVIRONMENT.md) - 개발환경 세팅
6. [SERVER_STARTUP_GUIDE.md](./SERVER_STARTUP_GUIDE.md) - 서버 구동 가이드
7. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 발생 시 참고

### 프로젝트 관리자

1. [PRD.md](./PRD.md) - 요구사항 및 목표
2. [TASK.md](./TASK.md) - 개발 작업 계획 및 일정
3. [RULE.md](./RULE.md) - 개발 규칙 및 체크리스트

### 아키텍트/기술 리더

1. [PRD.md](./PRD.md) - 비기능 요구사항 파악
2. [ARCHITECTURE_ALL.md](./ARCHITECTURE_ALL.md) - 전체 아키텍처 검토
3. [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md) - 백엔드 상세 설계
4. [ARCHITECTURE_FRONTEND.md](./ARCHITECTURE_FRONTEND.md) - 프론트엔드 상세 설계
5. [ARCHITECTURE_MOBILE.md](./ARCHITECTURE_MOBILE.md) - 모바일 상세 설계
6. [RULE.md](./RULE.md) - 아키텍처 원칙 및 규칙

---

## 🔑 핵심 개념 요약

### 좌석 상태 (7가지)

- **AVAILABLE**: 예매 가능
- **HOLD**: 임시 점유 (Redis + TTL)
- **PAYMENT_PENDING**: PG 요청 중
- **RESERVED**: 결제 완료
- **CANCELLED**: 예매 취소
- **BLOCKED**: 운영 차단
- **DISABLED**: 물리적 사용 불가

### 기술 스택

- **Backend**: Spring Boot 4.0.2, Java 21
- **Frontend (Web)**: React, TypeScript, Vite
- **Frontend (Mobile)**: Flutter, Riverpod
- **Database**:
  - 개발 환경: H2 (인메모리)
  - 운영 환경: MySQL 8.0
- **Cache/Lock**: Redis
- **Infrastructure**: Docker, Nginx

### 성능 목표

- 동시 접속자: 1000명
- 좌석 클릭 TPS: 1000
- 좌석 클릭 응답 시간: < 200ms

### 주요 아키텍처 패턴

- Domain-Driven Design (DDD)
- Aggregate Root: Screening
- 분산 락 (Redisson)
- Redis + DB 혼합 (Redis: Cache/Lock, DB: Source of Truth)
- WebSocket/SSE를 통한 실시간 갱신

---

## 📝 문서 작성 규칙

1. **Markdown 형식 사용**
2. **다이어그램은 Mermaid 사용** (C4 Model, ERD, Sequence Diagram, State Machine 등)
3. **코드 예시는 구체적이고 실행 가능하게 작성**
4. **문서 상단에 목차 포함**
5. **대상 독자 명시**
6. **업데이트 시 README.md도 함께 업데이트**

---

## 🔄 문서 업데이트 이력

| 날짜 | 문서 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-01-23 | README.md | 초기 작성 - 문서 목차 및 설명 추가 | Copilot |
| 2026-01-23 | TASK.md | Step 1-2 완료 상태 업데이트 | Team |
| 2026-01-22 | All | 초기 문서 작성 | Team |

---

## 📧 문의 및 기여

문서 오류 발견 시 또는 개선 사항 제안은 이슈를 등록해 주세요.

- 문서 오류: Issue 라벨 `documentation`
- 기술 질문: Issue 라벨 `question`
- 개선 제안: Issue 라벨 `enhancement`

---

**Last Updated:** 2026-01-23
