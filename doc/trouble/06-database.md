# 데이터베이스 관련 문제

## H2 콘솔 접속 방법 (개발 환경)

개발 환경(`dev` 프로파일)에서는 H2 인메모리 데이터베이스를 사용합니다.

### 접속 정보

| 항목 | 값 |
|------|------|
| URL | `http://localhost:8080/h2-console` |
| JDBC URL | `jdbc:h2:mem:cinema` |
| Driver Class | `org.h2.Driver` |
| Username | `sa` |
| Password | (비워두기) |

### 설정 위치

`src/main/resources/application-dev.yml`:

```yaml
spring:
  h2:
    console:
      enabled: true           # H2 콘솔 활성화
      path: /h2-console       # 접속 경로
      settings:
        trace: false          # SQL 트레이스 비활성화
        web-allow-others: false  # 외부 접속 차단 (보안)
```

### 주의사항

- H2 콘솔은 **개발 환경에서만 활성화**되어야 합니다.
- `web-allow-others: true`로 설정하면 외부에서 접속 가능하므로 **보안에 주의**하세요.
- 인메모리 DB이므로 **서버 재시작 시 데이터가 초기화**됩니다.

---

## 테스트 데이터 자동 로드 (개발 환경)

개발 환경에서 서버 시작 시 테스트 데이터가 자동으로 로드됩니다.

### 설정 위치

`src/main/resources/application-dev.yml`:

```yaml
spring:
  jpa:
    defer-datasource-initialization: true   # JPA 스키마 생성 후 SQL 실행
    hibernate:
      ddl-auto: create                      # 매번 스키마 새로 생성

  sql:
    init:
      mode: always                          # 항상 SQL 초기화 실행
      data-locations: classpath:data/test_data.sql
```

### 테스트 데이터 파일

`src/main/resources/data/test_data.sql`:

| 데이터 | 내용 |
|--------|------|
| 회원 | admin, user1~3 (비밀번호: password123) |
| 영화 | 어벤져스, 기생충, 인터스텔라, 듄, 범죄도시4 |
| 영화관 | CGV 강남, CGV 용산 |
| 상영관 | 1관, 2관, IMAX관, 4DX관 |
| 좌석 | 1관 일부 좌석 (NORMAL, VIP, PREMIUM) |
| 가격정책 | 1관 평일/주말 가격 |
| 상영스케줄 | 오늘/내일 상영 |

### 테스트 계정

| 아이디 | 비밀번호 | 권한 |
|--------|----------|------|
| admin | password123 | ADMIN |
| user1 | password123 | USER |
| user2 | password123 | USER |
| user3 | password123 | USER |

### 주의사항

- `ddl-auto: create`는 **개발 환경에서만** 사용하세요. 운영 환경에서는 `validate` 또는 `none` 사용.
- `defer-datasource-initialization: true`가 있어야 JPA 스키마 생성 후 SQL이 실행됩니다.
- H2용 SQL 파일(`test_data.sql`)은 MySQL과 구문이 다릅니다.

---

## 문제: 데이터베이스 연결 실패

**에러 메시지:**

```
Communications link failure
```

**해결 방법:**

### 1. application.properties 확인

`src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/product_mng
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 2. 데이터베이스 서버 실행 확인

MySQL이 실행 중인지 확인:

```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### 3. 데이터베이스 생성

```sql
CREATE DATABASE IF NOT EXISTS product_mng;
```

---

## 포트 충돌 문제

### 문제: 포트가 이미 사용 중

**에러 메시지:**

```
Port 8080 is already in use
```

**해결 방법:**

### 1. 사용 중인 포트 확인

Windows:

```powershell
netstat -ano | findstr :8080
```

Linux/Mac:

```bash
lsof -i :8080
```

### 2. 프로세스 종료

Windows:

```powershell
taskkill /PID <PID> /F
```

Linux/Mac:

```bash
kill -9 <PID>
```

### 3. 포트 변경

`application.properties`:

```properties
server.port=8081
```
