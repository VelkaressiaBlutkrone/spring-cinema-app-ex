# Cinema App - Infrastructure Guide

영화관 예매 시스템의 로컬 개발 환경 설정 가이드입니다.

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [빠른 시작](#빠른-시작)
3. [서비스 구성](#서비스-구성)
4. [환경 변수 설정](#환경-변수-설정)
5. [Docker 명령어](#docker-명령어)
6. [데이터베이스](#데이터베이스)
7. [Redis](#redis)
8. [Nginx](#nginx)
9. [문제 해결](#문제-해결)

---

## 사전 요구사항

- **Docker Desktop**: 4.0 이상
- **Docker Compose**: V2 이상
- **Git**: 버전 관리

### 설치 확인

```bash
docker --version
docker-compose --version
```

---

## 빠른 시작

### 1. 환경 변수 설정

```bash
cd infra
cp .env.example .env
# 필요 시 .env 파일 수정
```

### 2. 컨테이너 실행

```bash
# MySQL + Redis 실행 (기본)
docker-compose up -d

# Nginx 포함 실행
docker-compose --profile with-nginx up -d
```

### 3. 상태 확인

```bash
docker-compose ps
```

### 4. 로그 확인

```bash
docker-compose logs -f
```

---

## 서비스 구성

| 서비스 | 컨테이너명 | 포트 | 프로파일 | 설명 |
|--------|------------|------|----------|------|
| MySQL | cinema-db | 3306 | (기본) | 메인 데이터베이스 |
| Redis | cinema-redis | 6379 | (기본) | 캐시/세션/분산락 |
| Backend | cinema-backend | 8080 | backend | Spring Boot API |
| Frontend | cinema-frontend | 5173 | frontend | React 웹 |
| Mobile | cinema-mobile | 5174 | mobile | Flutter Web |
| Nginx | cinema-nginx | 80, 443 | with-nginx | 리버스 프록시 (선택) |

> **Backend/Frontend/Mobile** 상세 설정은 [doc/DOCKER_SETUP.md](../doc/DOCKER_SETUP.md) 참고

---

## 환경 변수 설정

### `.env` 파일 설정

```bash
# MySQL 설정
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=cinema
MYSQL_USER=cinema_user
MYSQL_PASSWORD=cinema_26118791
MYSQL_PORT=3306

# Redis 설정
REDIS_PORT=6379

# Nginx 설정 (선택)
NGINX_PORT=80
NGINX_SSL_PORT=443
```

---

## Docker 명령어

### 기본 명령어

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 컨테이너 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f [service_name]

# 상태 확인
docker-compose ps
```

### 데이터 초기화

```bash
# 볼륨 포함 삭제 (데이터 초기화)
docker-compose down -v

# 다시 시작 (초기 데이터 재생성)
docker-compose up -d
```

### 개별 서비스 관리

```bash
# MySQL만 재시작
docker-compose restart cinema-db

# Redis만 재시작
docker-compose restart cinema-redis
```

---

## 데이터베이스

### MySQL 접속

```bash
# Docker 컨테이너로 접속
docker exec -it cinema-db mysql -u cinema_user -p

# 비밀번호: cinema_26118791
```

### 외부 클라이언트 접속 정보

- **Host**: localhost
- **Port**: 3306
- **Database**: cinema
- **Username**: cinema_user
- **Password**: cinema_26118791

### 초기 데이터

Docker 최초 실행 시 다음 SQL이 자동 실행됩니다:

1. `01_schema.sql`: 테이블 스키마 생성
2. `02_test_data.sql`: 테스트 데이터 삽입

### 테스트 계정

| 로그인 ID | 비밀번호 | 역할 |
|-----------|----------|------|
| admin | password123 | ADMIN |
| user1 | password123 | USER |
| user2 | password123 | USER |
| user3 | password123 | USER |

---

## Redis

### Redis CLI 접속

```bash
docker exec -it cinema-redis redis-cli
```

### 기본 명령어

```bash
# 연결 테스트
PING

# 모든 키 조회
KEYS *

# 키 값 조회
GET key_name

# 키 삭제
DEL key_name

# TTL 확인
TTL key_name
```

### Redis Key 네이밍 규칙

```
seat:hold:{screeningId}:{seatId}      # HOLD 정보
seat:status:{screeningId}              # 좌석 상태 캐시
lock:seat:{screeningId}:{seatId}       # 분산 락
```

---

## Nginx

### Nginx 포함 실행

```bash
docker-compose --profile with-nginx up -d
```

### 설정 파일

- `nginx/nginx.conf`: 메인 설정
- `nginx/conf.d/default.conf`: 서버 설정

### 라우팅 규칙

| 경로 | 대상 |
|------|------|
| `/api/*` | Spring Boot (8080) |
| `/admin/*` | Spring Boot (8080) |
| `/ws/*` | WebSocket (Spring Boot) |
| `/sse/*` | SSE (Spring Boot) |
| `/*` | React (5173) |

---

## 문제 해결

### 포트 충돌

다른 프로세스가 포트를 사용 중인 경우:

```bash
# 포트 사용 확인 (Windows)
netstat -ano | findstr :3306
netstat -ano | findstr :6379

# 포트 변경 (.env 파일 수정)
MYSQL_PORT=3307
REDIS_PORT=6380
```

### MySQL 초기화 실패

```bash
# 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up -d
```

### Redis 연결 실패

```bash
# 컨테이너 로그 확인
docker-compose logs cinema-redis

# 컨테이너 재시작
docker-compose restart cinema-redis
```

### 헬스체크 실패

```bash
# 헬스 상태 확인
docker inspect --format='{{json .State.Health}}' cinema-db
docker inspect --format='{{json .State.Health}}' cinema-redis
```

### 컨테이너 초기화

```bash
# 모든 컨테이너 및 볼륨 삭제
docker-compose down -v --remove-orphans

# 이미지까지 삭제
docker-compose down -v --rmi all

# 다시 시작
docker-compose up -d
```

---

## 주의사항

1. **운영 환경에서는 비밀번호 변경 필수**
2. `.env` 파일은 Git에 커밋하지 않음 (`.gitignore` 추가)
3. 데이터 영속성을 위해 볼륨 사용
4. Redis는 메모리 기반이므로 중요 데이터는 DB에 저장

---

## 참고

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
