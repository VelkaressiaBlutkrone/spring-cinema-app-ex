# Docker 환경 설정 가이드

본 문서는 영화관 예매 시스템의 **MySQL, Redis를 제외한** 백엔드, 프론트엔드, 모바일(Flutter Web) 애플리케이션을 Docker로 실행하기 위한 설정 가이드입니다.

---

## 목차

1. [개요](#1-개요)
2. [서비스 구성](#2-서비스-구성)
3. [사전 요구사항](#3-사전-요구사항)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [실행 방법](#5-실행-방법)
6. [프로파일별 사용법](#6-프로파일별-사용법)
7. [포트 및 접속 정보](#7-포트-및-접속-정보)
8. [빌드 및 디버깅](#8-빌드-및-디버깅)
9. [문제 해결](#9-문제-해결)
10. [참고 문서](#10-참고-문서)

---

## 1. 개요

### 1.1 Docker Compose 서비스 구성

| 구분 | 서비스 | 프로파일 | 설명 |
|------|--------|----------|------|
| **인프라** | cinema-db | (기본) | MySQL 8.0 |
| | cinema-redis | (기본) | Redis 7.x |
| **백엔드** | cinema-backend | backend, frontend, mobile, app | Spring Boot 4.0.2 (Java 21) |
| **프론트엔드** | cinema-frontend | frontend, app | React + Vite (Node 20) |
| **모바일** | cinema-mobile | mobile, app | Flutter Web |
| **선택** | cinema-nginx | with-nginx | Nginx 리버스 프록시 |

### 1.2 디렉터리 구조

```
infra/
├── docker-compose.yml          # 메인 compose (MySQL, Redis, Backend, Frontend, Mobile)
├── .env                        # 환경 변수 (cp .env.example .env)
├── .env.example
├── docker/
│   ├── backend/
│   │   └── Dockerfile          # Spring Boot 빌드
│   ├── frontend/
│   │   ├── Dockerfile          # React + Vite 빌드
│   │   └── nginx.conf          # 프론트엔드 nginx 설정
│   └── mobile/
│       ├── Dockerfile          # Flutter Web 빌드
│       └── nginx.conf          # 모바일 nginx 설정
├── mysql/
├── redis/
└── nginx/
```

---

## 2. 서비스 구성

### 2.1 Backend (cinema-backend)

- **이미지**: Eclipse Temurin 21 JRE (Alpine)
- **빌드**: Gradle `bootJar` (Spring Boot 4.0.2)
- **프로파일**: `prod` (MySQL, Redis 연결)
- **의존성**: cinema-db, cinema-redis (healthcheck 완료 후 시작)
- **환경 변수**:
  - `SPRING_DATASOURCE_URL`: `jdbc:mysql://cinema-db:3306/cinema...`
  - `SPRING_DATA_REDIS_HOST`: `cinema-redis`
  - `SPRING_PROFILES_ACTIVE`: `prod`

### 2.2 Frontend (cinema-frontend)

- **이미지**: Node 20 (빌드) → Nginx Alpine (런타임)
- **빌드**: `npm ci` → `npm run build` (`VITE_API_BASE_URL=/api`)
- **의존성**: cinema-backend
- **API 프록시**: nginx가 `/api`, `/ws`, `/sse`, `/admin` → cinema-backend:8080

### 2.3 Mobile (cinema-mobile)

- **이미지**: Flutter SDK (빌드) → Nginx Alpine (런타임)
- **빌드**: `flutter build web --dart-define=WEB_API_BASE_URL=` (상대 경로 /api)
- **의존성**: cinema-backend
- **API 프록시**: nginx가 `/api`, `/ws`, `/sse` → cinema-backend:8080
- **주의**: `mobile/lib/config/api_config.dart`의 `WEB_API_BASE_URL`로 Docker 빌드 시 상대 경로 사용

---

## 3. 사전 요구사항

- **Docker Desktop** 4.0 이상 (또는 Docker Engine + Docker Compose V2)
- **디스크 여유 공간**: 약 3GB 이상 (이미지 + 빌드 캐시)
- **메모리**: 최소 4GB 권장

### 확인

```bash
docker --version
docker compose version
```

---

## 4. 환경 변수 설정

### 4.1 .env 파일 생성

```bash
cd infra
cp .env.example .env
```

### 4.2 필수 변수 (.env)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `MYSQL_ROOT_PASSWORD` | rootpassword | MySQL root 비밀번호 |
| `MYSQL_DATABASE` | cinema | DB 이름 |
| `MYSQL_USER` | cinema_user | DB 사용자 |
| `MYSQL_PASSWORD` | cinema_26118791 | DB 비밀번호 |
| `MYSQL_PORT` | 3306 | MySQL 포트 |
| `REDIS_PORT` | 6379 | Redis 포트 |

### 4.3 앱 포트 (.env, 선택)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `BACKEND_PORT` | 8080 | Backend 노출 포트 |
| `FRONTEND_PORT` | 5173 | Frontend 노출 포트 |
| `MOBILE_PORT` | 5174 | Mobile 노출 포트 |

### 4.4 JWT 등 보안 설정

운영 환경에서는 반드시 `.env`에서 `JWT_SECRET` 등을 변경하세요.

---

## 5. 실행 방법

### 5.1 기본 실행 (MySQL + Redis만)

```bash
cd infra
docker compose up -d
```

### 5.2 Backend 포함 실행

```bash
cd infra
docker compose --profile backend up -d
```

### 5.3 Frontend 포함 실행 (Backend 자동 포함)

```bash
cd infra
docker compose --profile frontend up -d
```

### 5.4 Mobile 포함 실행 (Backend 자동 포함)

```bash
cd infra
docker compose --profile mobile up -d
```

### 5.5 전체 앱 실행 (Backend + Frontend + Mobile)

```bash
cd infra
docker compose --profile app up -d
```

---

## 6. 프로파일별 사용법

### 6.1 프로파일 요약

| 명령어 | 실행 서비스 |
|--------|-------------|
| `docker compose up -d` | cinema-db, cinema-redis |
| `--profile backend` | + cinema-backend |
| `--profile frontend` | + cinema-backend, cinema-frontend |
| `--profile mobile` | + cinema-backend, cinema-mobile |
| `--profile app` | + cinema-backend, cinema-frontend, cinema-mobile |

### 6.2 프로파일 조합 예시

```bash
# Backend + Frontend만
docker compose --profile frontend up -d

# Backend + Mobile만
docker compose --profile mobile up -d

# 전체 (인프라 + 앱)
docker compose --profile app up -d

# Nginx 리버스 프록시까지 (기존 프로파일)
docker compose --profile app --profile with-nginx up -d
```

---

## 7. 포트 및 접속 정보

### 7.1 기본 포트

| 서비스 | 포트 | 접속 URL |
|--------|------|----------|
| MySQL | 3306 | `localhost:3306` (cinema_user / cinema_26118791) |
| Redis | 6379 | `localhost:6379` |
| Backend | 8080 | <http://localhost:8080> |
| Frontend | 5173 | <http://localhost:5173> |
| Mobile | 5174 | <http://localhost:5174> |

### 7.2 Frontend / Mobile 접속 시

- Frontend: <http://localhost:5173> → React SPA, `/api` 요청은 Backend로 프록시
- Mobile: <http://localhost:5174> → Flutter Web, `/api` 요청은 Backend로 프록시
- 두 앱 모두 같은 Backend(8080) API를 사용합니다.

---

## 8. 빌드 및 디버깅

### 8.1 이미지 재빌드

```bash
cd infra

# Backend만 재빌드
docker compose build cinema-backend

# Frontend만 재빌드
docker compose build cinema-frontend

# Mobile만 재빌드
docker compose build cinema-mobile

# 전체 재빌드 (캐시 없이)
docker compose build --no-cache
```

### 8.2 로그 확인

```bash
# Backend 로그
docker compose logs -f cinema-backend

# Frontend 로그
docker compose logs -f cinema-frontend

# Mobile 로그
docker compose logs -f cinema-mobile

# 전체 로그
docker compose logs -f
```

### 8.3 컨테이너 상태 확인

```bash
docker compose ps
```

### 8.4 컨테이너 내부 접속

```bash
# Backend 셸
docker exec -it cinema-backend sh

# Frontend nginx 설정 확인
docker exec -it cinema-frontend cat /etc/nginx/conf.d/default.conf
```

---

## 9. 문제 해결

### 9.1 Backend 시작 실패

**증상**: cinema-backend가 재시작을 반복함

**확인 사항**:

- cinema-db, cinema-redis가 `healthy` 상태인지 확인
- `.env`의 `MYSQL_PASSWORD`가 `application-prod.yml` 또는 init 스크립트와 일치하는지 확인
- MySQL 초기화가 완료되었는지 확인 (최초 실행 시 30초 이상 소요)

```bash
docker compose logs cinema-db
docker compose logs cinema-backend
```

### 9.2 Frontend/Mobile에서 API 호출 실패

**증상**: 로그인/API 호출 시 CORS 또는 연결 오류

**확인 사항**:

- cinema-backend가 정상 동작 중인지 확인
- 브라우저에서 <http://localhost:5173> 또는 <http://localhost:5174> 로 접속했는지 확인 (다른 포트면 프록시 경로 확인)
- nginx 설정에서 `proxy_pass http://cinema-backend:8080`이 올바른지 확인

### 9.3 Flutter Web 빌드 실패

**증상**: `cinema-mobile` 빌드 시 Flutter 오류

**확인 사항**:

- Flutter Docker 이미지(`ghcr.io/cirruslabs/flutter:stable`) 다운로드가 완료되었는지 확인
- `mobile/pubspec.yaml`의 `sdk: ^3.10.7`이 Flutter 이미지와 호환되는지 확인

```bash
# Mobile 이미지 수동 빌드하여 상세 로그 확인
cd infra
docker compose build --no-cache cinema-mobile
```

### 9.4 포트 충돌

**증상**: `port is already allocated`

**해결**:

- `.env`에서 `BACKEND_PORT`, `FRONTEND_PORT`, `MOBILE_PORT` 변경
- 또는 기존 프로세스 종료 후 재시작

### 9.5 볼륨/캐시 초기화

```bash
cd infra

# 컨테이너 + 볼륨 삭제 (MySQL/Redis 데이터 초기화)
docker compose down -v

# 이미지까지 삭제
docker compose down -v --rmi local

# 다시 시작
docker compose --profile app up -d
```

---

## 10. 참고 문서

- [DEVELOPMENT_ENVIRONMENT.md](./DEVELOPMENT_ENVIRONMENT.md) - 로컬 개발환경 세팅
- [SERVER_STARTUP_GUIDE.md](./SERVER_STARTUP_GUIDE.md) - 프로파일별 DB 설정
- [infra/README.md](../infra/README.md) - MySQL, Redis 상세 가이드
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 일반 문제 해결

---

**Last Updated:** 2026-02-03
