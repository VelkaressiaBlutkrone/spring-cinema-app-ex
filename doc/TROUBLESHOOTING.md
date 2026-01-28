# 문제 해결 가이드 (Troubleshooting Guide)

본 문서는 프로젝트 개발 중 발생하는 문제와 해결 방법을 정리한 문서입니다.

> **참고**: 문서가 길어져서 카테고리별로 분리되었습니다. 아래 링크에서 해당 문제를 찾아보세요.

## 목차

| 문서 | 설명 |
|------|------|
| [01-general.md](./trouble/01-general.md) | 일반적인 문제 해결 절차, 체크리스트 |
| [02-typescript-react.md](./trouble/02-typescript-react.md) | TypeScript/React 관련 문제 (JSX, import, enum 등) |
| [03-cors.md](./trouble/03-cors.md) | CORS 관련 문제 |
| [04-spring-boot.md](./trouble/04-spring-boot.md) | Spring Boot/백엔드 관련 문제 (AOP, Gson, 테스트 등) |
| [05-build.md](./trouble/05-build.md) | 빌드 관련 문제 (Gradle, Vite, npm) |
| [06-database.md](./trouble/06-database.md) | 데이터베이스 연결, 포트 충돌 문제 |
| [07-cinema-app.md](./trouble/07-cinema-app.md) | Cinema App 프로젝트 관련 문제 (QueryDSL, Redis, DDD 등) |
| [08-config-guide.md](./trouble/08-config-guide.md) | 설정 가이드 (Path Alias 등) |
| [09-history.md](./trouble/09-history.md) | 문제 해결 이력 테이블 |
| [10-recent-issues.md](./trouble/10-recent-issues.md) | **최근 해결한 문제점 (2026-01-28)** |

## 빠른 검색

### 에러 메시지별 찾기

| 에러 메시지 | 문서 |
|------------|------|
| `react/jsx-runtime` | [02-typescript-react.md](./trouble/02-typescript-react.md) |
| `erasableSyntaxOnly` | [02-typescript-react.md](./trouble/02-typescript-react.md) |
| `verbatimModuleSyntax` | [02-typescript-react.md](./trouble/02-typescript-react.md) |
| `CORS policy` | [03-cors.md](./trouble/03-cors.md) |
| `spring-boot-starter-aop` | [04-spring-boot.md](./trouble/04-spring-boot.md) |
| `NoSuchBeanDefinitionException` | [04-spring-boot.md](./trouble/04-spring-boot.md) |
| `compileJava` 실패 | [05-build.md](./trouble/05-build.md) |
| `Failed to resolve import` | [05-build.md](./trouble/05-build.md) |
| `Communications link failure` | [06-database.md](./trouble/06-database.md) |
| `Port is already in use` | [06-database.md](./trouble/06-database.md) |
| `The type Q... is already defined` | [07-cinema-app.md](./trouble/07-cinema-app.md) |
| `ClassNotFoundException: CinemaApplication` | [07-cinema-app.md](./trouble/07-cinema-app.md) |
| `RedisConnectionException` | [07-cinema-app.md](./trouble/07-cinema-app.md) |
| `RedissonAutoConfigurationV2` | [07-cinema-app.md](./trouble/07-cinema-app.md) |

### 카테고리별 주요 문제

#### 프론트엔드
- TypeScript JSX 오류 → [02-typescript-react.md](./trouble/02-typescript-react.md)
- Vite 빌드 실패 → [05-build.md](./trouble/05-build.md)
- Tailwind CSS 미적용 → [05-build.md](./trouble/05-build.md)
- Path Alias 설정 → [08-config-guide.md](./trouble/08-config-guide.md)

#### 백엔드
- Spring Boot 의존성 → [04-spring-boot.md](./trouble/04-spring-boot.md)
- Gradle 빌드 → [05-build.md](./trouble/05-build.md)
- DB 연결 → [06-database.md](./trouble/06-database.md)
- Redis 연결 → [07-cinema-app.md](./trouble/07-cinema-app.md)

#### Cinema App 프로젝트
- QueryDSL Q클래스 → [07-cinema-app.md](./trouble/07-cinema-app.md)
- Redisson/Redis → [07-cinema-app.md](./trouble/07-cinema-app.md)
- 도메인 예외 처리 → [07-cinema-app.md](./trouble/07-cinema-app.md)
