# 최근 해결한 문제점 정리 (2026-01-28)

개발 환경(dev) 및 로컬 실행·로그인 검증과 관련해 해결한 항목을 정리한 문서입니다.

---

## 1. H2 Console 404

- **증상**: `http://localhost:8080/h2-console` 접속 시 404
- **원인**: Spring Boot 4에서 H2 Console 자동 설정이 동작하지 않음. H2 의존성이 `runtimeOnly`라 컴파일 시 H2 클래스 미노출.
- **조치**:
  - `build.gradle`: H2 의존성 `runtimeOnly` → `implementation`
  - `H2WebConsoleServerConfig` 추가: dev 프로파일에서 H2 Web Console을 **포트 8082**로 기동
- **접속**: `http://localhost:8082`, JDBC URL `jdbc:h2:mem:cinema`

---

## 2. SQL 초기화(test_data.sql) 미실행

- **증상**: 서버 기동 후 H2에 테스트 데이터가 들어가지 않음. INSERT 관련 로그 없음.
- **원인**: `application.yml`에서 `spring.sql.init.mode: never`로 설정되어 SQL 초기화 비활성화.
- **조치**: `application.yml`의 `sql.init.mode`를 `embedded`로 변경. (H2 등 임베디드 DB에서만 초기화 실행)

---

## 3. admin 로그인 시 passwordEncoder.matches 통과 실패

- **증상**: admin / password123 로그인 시 "아이디 또는 비밀번호가 일치하지 않습니다."
- **원인**: test_data.sql에 들어간 BCrypt 해시가 앱의 `BCryptPasswordEncoder`로 검증했을 때 "password123"과 일치하지 않음(해시 불일치).
- **조치**:
  - **DevDataLoader** 추가: dev 프로파일 기동 후 `admin`, `user1`, `user2`, `user3`의 비밀번호를 앱의 `PasswordEncoder.encode("password123")` 결과로 DB에 반영.
  - test_data.sql의 회원 비밀번호 해시를 동일 인코더로 생성한 해시로 갱신.
- **참고**: `src/test/java/com/cinema/util/PasswordHashGenerator`로 "password123" 해시 생성 가능.

---

## 4. HttpRequestMethodNotSupportedException (GET is not supported)

- **증상**: GET으로 지원하지 않는 경로 요청 시 스택트레이스가 ERROR 로그로 출력됨.
- **조치**: `GlobalExceptionHandler`에 `HttpRequestMethodNotSupportedException` 전용 핸들러 추가 → 405(METHOD_NOT_ALLOWED) 반환, WARN 한 줄 로그만 출력.

---

## 5. F5 실행 시 "cinema-backend is not a valid java project"

- **증상**: 디버거/실행 구성에서 프로젝트 인식 실패.
- **조치**: `.vscode/launch.json`에 **Run Spring Boot (Gradle)** 구성 추가 (`type: node-terminal`, Gradle bootRun 직접 실행). F5 시 해당 구성 선택.

---

## 6. H2ConsoleConfig 컴파일 오류 (JakartaWebServlet)

- **증상**: `org.h2.server.web.JakartaWebServlet` 패키지不存在로 컴파일 실패.
- **조치**: `H2ConsoleConfig.java` 삭제. H2 Console은 `H2WebConsoleServerConfig`(포트 8082)만 사용.

---

## 관련 문서

- **전체 이력**: [09-history.md](./09-history.md)
- **H2 콘솔/테스트 데이터**: [06-database.md](./06-database.md)
- **Cinema App 문제**: [07-cinema-app.md](./07-cinema-app.md)
