# Step 21: 배포 준비 및 CI/CD 구현 요약

## 구현 항목

### 1. CI/CD (GitHub Actions)

- **`.github/workflows/ci.yml`**: main/develop push·PR 시 자동 빌드·테스트
- Java 21, Gradle 캐시, 단위 테스트 실행
- 테스트 리포트 업로드 (build/reports/tests/test/)

### 2. API 문서 (OpenAPI 3 / Swagger)

- **springdoc-openapi-starter-webmvc-ui**
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- `OpenApiConfig`: API 정보 설정

### 3. 프로덕션 설정

- **application-prod.yml**: CORS, secure-cookie, Swagger on/off
- **docker-compose**: Redisson Redis 주소 (REDISSON_SINGLE_SERVER_CONFIG_ADDRESS)
- **infra/.env.example**: JWT, Redisson 등 환경 변수 예시

### 4. 문서

- **DEPLOYMENT.md**: 배포 절차, Docker Compose, 환경 변수
- **OPERATIONS.md**: 모니터링, 장애 대응, 백업, 보안 점검
