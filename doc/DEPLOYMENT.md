# 배포 가이드 (Step 21)

## 1. 개요

영화관 예매 시스템의 프로덕션 배포 절차를 설명합니다.

### 1.1 배포 구성

| 구성 요소 | 설명 |
|----------|------|
| Backend | Spring Boot 4 (Java 21) |
| Frontend | React + Vite (정적 빌드) |
| Mobile | Flutter Web (정적 빌드) |
| DB | MySQL 8.0 |
| Cache | Redis 7.x |
| Reverse Proxy | Nginx (선택) |

---

## 2. 사전 요구사항

- Docker 24+ 및 Docker Compose 2.x
- (선택) Kubernetes, AWS ECS 등 컨테이너 오케스트레이션
- MySQL 8.0, Redis 7.x (Docker 또는 관리형 서비스)

---

## 3. 환경 변수 설정

`infra/.env` 파일을 생성하고 다음 변수를 설정합니다.

```bash
cp infra/.env.example infra/.env
# .env 편집
```

### 필수 환경 변수

| 변수 | 설명 | 예시 |
|------|------|------|
| MYSQL_ROOT_PASSWORD | MySQL root 비밀번호 | (보안용 강력한 비밀번호) |
| MYSQL_PASSWORD | cinema DB 사용자 비밀번호 | (강력한 비밀번호) |
| JWT_SECRET | JWT 서명용 시크릿 (Base64) | (64자 이상 권장) |

### 선택 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| MYSQL_PORT | 3306 | MySQL 포트 |
| REDIS_PORT | 6379 | Redis 포트 |
| BACKEND_PORT | 8080 | 백엔드 포트 |
| FRONTEND_PORT | 5173 | 프론트엔드 포트 |
| MOBILE_PORT | 5174 | 모바일 웹 포트 |

---

## 4. Docker Compose 배포

### 4.1 전체 스택 실행

```bash
cd infra
docker compose --profile app up -d
```

- `app` 프로파일: DB, Redis, Backend, Frontend, Mobile
- `backend` 프로파일: DB, Redis, Backend만

### 4.2 단계별 실행

```bash
# 1. 인프라만 (DB, Redis)
docker compose up -d cinema-db cinema-redis

# 2. 백엔드
docker compose --profile backend up -d cinema-backend

# 3. 프론트엔드 + 모바일
docker compose --profile frontend up -d cinema-frontend cinema-mobile
```

### 4.3 빌드 후 실행

```bash
docker compose --profile app build --no-cache
docker compose --profile app up -d
```

---

## 5. 프로덕션 설정 체크리스트

- [ ] `application-prod.yml` 적용 (SPRING_PROFILES_ACTIVE=prod)
- [ ] MySQL 스키마 초기화 (`infra/mysql/init/01_schema.sql` 수동 또는 init 컨테이너)
- [ ] JWT_SECRET 운영용으로 변경
- [ ] CORS `cors.allowed-origins` 운영 도메인으로 제한
- [ ] `auth.refresh-token.secure-cookie: true` (HTTPS 환경)
- [ ] Swagger UI 프로덕션 비활성화 (선택): `springdoc.swagger-ui.enabled: false`

---

## 6. 포트 및 접속

| 서비스 | 포트 | URL |
|--------|------|-----|
| Backend | 8080 | http://localhost:8080 |
| Frontend | 5173 | http://localhost:5173 |
| Mobile | 5174 | http://localhost:5174 |
| API 문서 | 8080 | http://localhost:8080/swagger-ui.html |
| Health | 8080 | http://localhost:8080/actuator/health |

---

## 7. 참고 문서

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker 상세 설정
- [OPERATIONS.md](./OPERATIONS.md) - 운영 가이드
