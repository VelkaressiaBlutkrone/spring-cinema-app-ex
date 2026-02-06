# 영화관 예매 시스템 문서 (Cinema Reservation System Documentation)

본 디렉토리는 영화관 예매 시스템 프로젝트의 모든 설계 문서, 개발 가이드 및 참고 자료를 포함하고 있습니다.

---

## 📚 문서 목차 (Table of Contents)

### 1. 프로젝트 기획 및 요구사항

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [PRD.md](./PRD.md) | 제품 요구사항 문서 (프로젝트 개요, 성능 목표, 기술 스택, 비기능 요구사항) | 프로젝트 관리자, 개발팀, 기획팀 |
| [RULE.md](./RULE.md) | 개발 규칙 및 아키텍처 원칙 (좌석 상태 관리, 분산 락, 트랜잭션, 코드 리뷰 체크리스트) | 개발팀 (필수 숙지) |
| [TASK.md](./TASK.md) | 상세 개발 작업 계획 (Step 1~21, 일정 약 60-80일) | 프로젝트 관리자, 개발팀 |

---

### 2. 아키텍처 설계

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [ARCHITECTURE_ALL.md](./ARCHITECTURE_ALL.md) | 전체 시스템 아키텍처 (C4 Model, 컨테이너 다이어그램, 데이터 흐름) | 아키텍트, 기술 리더, 개발팀 |
| [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md) | 백엔드 아키텍처 (ERD, 좌석 상태 머신, DDD 패키지 구조) | 백엔드 개발자, 아키텍트 |
| [ARCHITECTURE_FRONTEND.md](./ARCHITECTURE_FRONTEND.md) | 프론트엔드 아키텍처 (React, TypeScript, Vite, 인증 흐름, 실시간 갱신) | 프론트엔드 개발자 |
| [ARCHITECTURE_MOBILE.md](./ARCHITECTURE_MOBILE.md) | 모바일 아키텍처 (Flutter, Riverpod + MVVM) | 모바일 개발자 |

---

### 3. 보안 및 인증

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [SECURITY_AUTH.md](./SECURITY_AUTH.md) | 인증·보안 상세 (HTTPS, Hybrid Encryption RSA+AES-GCM, JWT, Refresh Cookie, OWASP) | 백엔드 개발자, 보안 담당자 |
| [USER_PROFILE.md](./USER_PROFILE.md) | 사용자 프로필 기능 (회원가입, 인증, 프로필 CRUD, HOLD 조회, API 명세) | 백엔드 개발자, 프론트엔드 개발자, 모바일 개발자 |

**주요 내용:**
- 로그인/회원가입 암호화 흐름 (RSA + AES-GCM Hybrid)
- JWT Access Token (15분) + Refresh Token (HttpOnly Cookie)
- Rate Limiting, Brute-force 방어
- OWASP 체크리스트 준수

---

### 4. 재사용 모듈 가이드

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [BACKEND_MODULES.md](./BACKEND_MODULES.md) | 백엔드 재사용 모듈 (전역 설정, AOP 로깅, 예외 처리, DTO 패턴) | 백엔드 개발자 |
| [FRONTEND_MODULES.md](./FRONTEND_MODULES.md) | 프론트엔드 재사용 모듈 (공통 컴포넌트, 유틸리티, 커스텀 훅, 타입 정의) | 프론트엔드 개발자 |
| [MOBILE_MODULES.md](./MOBILE_MODULES.md) | 모바일 재사용 모듈 | 모바일 개발자 |

---

### 5. 개발 환경 및 서버 구동

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [DEVELOPMENT_ENVIRONMENT.md](./DEVELOPMENT_ENVIRONMENT.md) | 개발환경 세팅 가이드 (Java 21, Spring Boot 4.0.2, Node.js, Flutter, Docker) | 신규 개발자, DevOps |
| [DOCKER_SETUP.md](./DOCKER_SETUP.md) | Docker 앱 환경 설정 (Backend/Frontend/Mobile Dockerfile, docker-compose) | DevOps, 개발팀 |
| [SERVER_STARTUP_GUIDE.md](./SERVER_STARTUP_GUIDE.md) | 서버 구동 가이드 (프로파일별 DB 설정, 연결 체크) | 백엔드 개발자, DevOps |
| [LOGGING.md](./LOGGING.md) | 로깅 가이드 (백엔드/프론트엔드/모바일 로그 정책, 7일 보관) | 개발팀, 운영팀 |

---

### 6. 테스트, 성능, 장애 대응

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [STEP18_FAILOVER.md](./STEP18_FAILOVER.md) | 장애 대응 및 복구 로직 (Redis 장애 시 동작, Health Check, 복구 흐름) | 백엔드 개발자, SRE |
| [STEP19_TESTING.md](./STEP19_TESTING.md) | 테스트 가이드 (단위 테스트, 통합 테스트, JaCoCo 커버리지) | 개발팀 |
| [STEP20_LOAD_TEST.md](./STEP20_LOAD_TEST.md) | 부하 테스트 가이드 (JMeter 시나리오, 성능 목표 확인) | 백엔드 개발자, QA |
| [STEP1_19_RULE_COMPLIANCE_REVIEW.md](./STEP1_19_RULE_COMPLIANCE_REVIEW.md) | Step 1~19 RULE 준수 검토 | 코드 리뷰어, 아키텍트 |

---

### 7. 배포 및 운영

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 배포 가이드 (프로덕션 배포 절차, Docker Compose, 환경 변수) | DevOps, 운영팀 |
| [STEP21_DEPLOYMENT.md](./STEP21_DEPLOYMENT.md) | 배포 준비 및 CI/CD (GitHub Actions, Swagger/OpenAPI, 프로덕션 설정) | DevOps, 개발팀 |
| [OPERATIONS.md](./OPERATIONS.md) | 운영 가이드 (모니터링, 장애 대응, 백업·복구, 보안 점검) | 운영팀, SRE |

---

### 8. 문제 해결 (Troubleshooting)

| 문서 | 설명 | 대상 독자 |
|------|------|----------|
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 문제 해결 가이드 (종합 요약) | 전체 개발팀 |

#### [trouble/](./trouble/) - 상세 문제 해결 문서

| 문서 | 설명 |
|------|------|
| [01-general.md](./trouble/01-general.md) | 일반적인 문제 해결 절차 및 체크리스트 |
| [02-typescript-react.md](./trouble/02-typescript-react.md) | TypeScript/React 관련 문제 (JSX, 모듈 경로 등) |
| [03-cors.md](./trouble/03-cors.md) | CORS 관련 문제 및 설정 |
| [04-spring-boot.md](./trouble/04-spring-boot.md) | Spring Boot/백엔드 관련 문제 (AOP, JSON 직렬화 등) |
| [05-build.md](./trouble/05-build.md) | 빌드 관련 문제 (Gradle, Vite) |
| [06-database.md](./trouble/06-database.md) | 데이터베이스 관련 문제 (H2 콘솔, 테스트 데이터) |
| [07-cinema-app.md](./trouble/07-cinema-app.md) | Cinema App 프로젝트 특화 문제 (QueryDSL Q클래스 중복 등) |
| [08-config-guide.md](./trouble/08-config-guide.md) | 설정 가이드 (TypeScript Import Path Alias 등) |
| [09-history.md](./trouble/09-history.md) | 문제 해결 이력 |
| [10-recent-issues.md](./trouble/10-recent-issues.md) | 최근 해결한 문제점 정리 (2026-01-28) |

---

## 📖 문서 읽기 순서 권장

### 🆕 신규 팀원 온보딩

```
1. PRD.md          ─── 프로젝트 개요 및 요구사항 이해
       ↓
2. RULE.md         ─── 개발 규칙 숙지 (필수!)
       ↓
3. ARCHITECTURE_ALL.md ─── 전체 시스템 아키텍처 파악
       ↓
4. 역할별 상세 문서
   ├─ 백엔드: ARCHITECTURE_BACKEND.md → BACKEND_MODULES.md → SECURITY_AUTH.md
   ├─ 프론트엔드: ARCHITECTURE_FRONTEND.md → FRONTEND_MODULES.md
   └─ 모바일: ARCHITECTURE_MOBILE.md → MOBILE_MODULES.md
       ↓
5. DEVELOPMENT_ENVIRONMENT.md ─── 개발환경 세팅
       ↓
6. SERVER_STARTUP_GUIDE.md ─── 서버 구동 가이드
       ↓
7. trouble/ 폴더 ─── 문제 발생 시 참고
```

### 📋 프로젝트 관리자

1. [PRD.md](./PRD.md) - 요구사항 및 목표
2. [TASK.md](./TASK.md) - 개발 작업 계획 및 일정
3. [RULE.md](./RULE.md) - 개발 규칙 및 체크리스트

### 🏗️ 아키텍트/기술 리더

1. [PRD.md](./PRD.md) - 비기능 요구사항 파악
2. [ARCHITECTURE_ALL.md](./ARCHITECTURE_ALL.md) - 전체 아키텍처 검토
3. [ARCHITECTURE_BACKEND.md](./ARCHITECTURE_BACKEND.md) - 백엔드 상세 설계
4. [SECURITY_AUTH.md](./SECURITY_AUTH.md) - 인증/보안 설계
5. [RULE.md](./RULE.md) - 아키텍처 원칙 및 규칙

### 🚀 DevOps/SRE

1. [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker 설정
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 절차
3. [STEP21_DEPLOYMENT.md](./STEP21_DEPLOYMENT.md) - CI/CD 구현
4. [OPERATIONS.md](./OPERATIONS.md) - 운영 가이드
5. [STEP18_FAILOVER.md](./STEP18_FAILOVER.md) - 장애 대응

---

## 🔑 핵심 개념 요약

### 좌석 상태 (7가지)

| 상태 | 설명 |
|------|------|
| `AVAILABLE` | 예매 가능 |
| `HOLD` | 임시 점유 (Redis + TTL) |
| `PAYMENT_PENDING` | PG 요청 중 |
| `RESERVED` | 결제 완료 |
| `CANCELLED` | 예매 취소 |
| `BLOCKED` | 운영 차단 |
| `DISABLED` | 물리적 사용 불가 |

### 기술 스택

| 영역 | 기술 |
|------|------|
| **Backend** | Spring Boot 4.0.2, Java 21, JPA, QueryDSL |
| **Frontend (Web)** | React, TypeScript, Vite, Zustand, Axios |
| **Frontend (Mobile)** | Flutter, Riverpod |
| **Database (Dev)** | H2 (인메모리) |
| **Database (Prod)** | MySQL 8.0 |
| **Cache/Lock** | Redis, Redisson |
| **Infrastructure** | Docker, Nginx |
| **CI/CD** | GitHub Actions |
| **API 문서** | Swagger/OpenAPI 3 |

### 성능 목표

| 항목 | 목표 |
|------|------|
| 동시 접속자 | 1,000명 |
| 좌석 클릭 TPS | 1,000 |
| 좌석 클릭 응답 시간 | < 200ms |

### 주요 아키텍처 패턴

- **Domain-Driven Design (DDD)**: Aggregate Root는 `Screening`
- **분산 락**: Redisson 기반
- **데이터 저장소 분리**: Redis (Cache/Lock) + MySQL (Source of Truth)
- **실시간 갱신**: WebSocket/SSE
- **인증**: JWT + Refresh Token (HttpOnly Cookie) + Hybrid Encryption

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
| 2026-02-05 | USER_PROFILE.md, README.md | 사용자 프로필 기능 문서 초안 작성, 목차에 추가 | Copilot |
| 2026-02-04 | README.md | 전면 개편 - 누락 문서 추가, 카테고리 재구성, trouble/ 폴더 문서화 | VelkaressiaBlutkrone |
| 2026-01-28 | trouble/ | 최근 문제점 정리 (10-recent-issues.md) | Team |
| 2026-01-23 | README.md | 초기 작성 - 문서 목차 및 설명 추가 | Copilot |
| 2026-01-23 | TASK.md | Step 1-2 완료 상태 업데이트 | Team |
| 2026-01-22 | All | 초기 문서 작성 | Team |

---

## 📧 문의 및 기여

문서 오류 발견 시 또는 개선 사항 제안은 이슈를 등록해 주세요.

| 라벨 | 용도 |
|------|------|
| `documentation` | 문서 오류 |
| `question` | 기술 질문 |
| `enhancement` | 개선 제안 |

---

**Last Updated:** 2026-02-05