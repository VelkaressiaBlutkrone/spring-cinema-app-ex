# 문제 해결 이력

| 날짜       | 문제                                                                        | 해결 방법                                                                                                         | 작성자 |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| 2024-01-XX | JSX 태그에 'react/jsx-runtime' 모듈 경로 오류                               | tsconfig.app.json에 jsxImportSource 추가                                                                          | -      |
| 2024-01-XX | spring-boot-starter-aop를 찾을 수 없음                                      | spring-boot-starter-aspectj로 변경 (Spring Boot 4.0 변경사항)                                                     | -      |
| 2024-01-XX | JSON 직렬화 라이브러리 변경                                                 | Jackson → Gson으로 변경, GsonConfig 추가                                                                         | -      |
| 2024-01-XX | WebRequest.getParameterNames() 타입 불일치                                  | Iterator `<String>`로 변경 (Spring Boot 4.0 변경사항)                                                           | -      |
| 2024-01-XX | TypeScript 모듈 export 런타임 오류                                          | Vite 캐시 삭제 및 개발 서버 재시작                                                                                | -      |
| 2024-01-XX | erasableSyntaxOnly로 인한 enum 사용 불가                                    | tsconfig.app.json에서 erasableSyntaxOnly 옵션 제거                                                                | -      |
| 2024-01-XX | TypeScript Import Path Alias 설정                                           | tsconfig.app.json과 vite.config.ts에 alias 설정 추가                                                              | -      |
| 2024-01-XX | verbatimModuleSyntax로 인한 타입 import 오류                                | 타입만 import하는 경우 `import type` 사용                                                                       | -      |
| 2024-01-XX | front_end에서 gradle 명령어 실행 오류                                       | 백엔드 빌드는 프로젝트 루트에서, 프론트엔드는 npm 사용                                                            | -      |
| 2024-01-XX | 테스트 실패: NoSuchBeanDefinitionException                                  | 테스트용 H2 인메모리 DB 설정 추가                                                                                 | -      |
| 2026-01-23 | spring-boot-starter-aop 찾을 수 없음                                        | Spring Milestone Repository 추가 및 AOP 의존성 변경                                                               | -      |
| 2026-01-23 | DDD 패키지 구조 정리                                                        | screen → screening 패키지 통합, 도메인별 분리                                                                    | -      |
| 2026-01-23 | 도메인 예외 처리 통합                                                       | IllegalStateException → 도메인별 공통 예외 클래스로 전환                                                         | -      |
| 2026-01-28 | RedissonAutoConfigurationV2 / RedisAutoConfiguration ClassNotFoundException | redisson-spring-boot-starter 제거, redisson 코어(3.40.2)만 사용. RedissonConfig에서 RedissonClient 수동 등록 유지 | -      |
| 2026-01-28 | Vite에서 react-router-dom·clsx 등 의존성 해석 실패                         | frontend 디렉터리에서 `npm install` 실행 후 개발 서버 재시작                                                    | -      |
| 2026-01-28 | CSS/Tailwind가 적용되지 않는 것처럼 보이는 현상                             | `frontend/src/index.css`에 `@import "tailwindcss";` 추가, `main.tsx`에서 `import '@/index.css';` 추가     | -      |
| 2026-01-28 | QueryDSL Q클래스 "The type Q... is already defined" 중복 정의               | `bin` 폴더 삭제, Gradle만 사용해 빌드(`.\gradlew clean compileJava`), IDE에서 Gradle 빌드 사용                | -      |
| 2026-01-28 | Could not find or load main class com.cinema.CinemaApplication              | `.\gradlew clean bootRun` 또는 Gradle 뷰에서 bootRun 실행. 필요 시 "Java: Clean Java Language Server Workspace" 후 launch/디버그 사용 | -      |
| 2026-01-28 | Redis 연결 실패 시 서버 종료 문제 (RedisConnectionException)                | RedissonConfig에서 try-catch 처리, DistributedLockManager/RedisService에서 null 안전 처리 (Graceful Degradation) | -      |
