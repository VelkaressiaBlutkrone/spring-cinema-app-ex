# 문제 해결 가이드 (Troubleshooting Guide)

본 문서는 프로젝트 개발 중 발생하는 문제와 해결 방법을 정리한 문서입니다.

## 목차

1. [일반적인 문제 해결 절차](#일반적인-문제-해결-절차)
2. [TypeScript/React 관련 문제](#typescriptreact-관련-문제)
3. [Spring Boot/백엔드 관련 문제](#spring-boot백엔드-관련-문제)
4. [빌드 관련 문제](#빌드-관련-문제)
5. [데이터베이스 관련 문제](#데이터베이스-관련-문제)
6. [CORS 관련 문제](#cors-관련-문제)
7. [포트 충돌 문제](#포트-충돌-문제)
8. [설정 가이드](#설정-가이드)
9. [문제 해결 이력](#문제-해결-이력)

---

## 일반적인 문제 해결 절차

1. **에러 메시지 확인**: 정확한 에러 메시지와 스택 트레이스 확인
2. **로그 확인**:
   - 백엔드: `logs/application.log`, `logs/error.log`
   - 프론트엔드: 브라우저 콘솔, 개발자 도구
3. **의존성 확인**:
   - 백엔드: `build.gradle` 의존성 버전
   - 프론트엔드: `package.json` 패키지 버전
4. **캐시 정리**:
   - Gradle: `./gradlew clean`
   - npm: `rm -rf node_modules && npm install`
5. **재시작**: IDE, 서버, 개발 서버 재시작

### 문제 해결 체크리스트

- [X] 에러 메시지를 정확히 읽고 이해했는가?
- [X] 관련 로그 파일을 확인했는가?
- [X] 의존성 버전이 호환되는가?
- [X] 캐시를 정리했는가?
- [X] 서버/개발 서버를 재시작했는가?
- [X] 환경 변수 설정이 올바른가?
- [X] 포트가 충돌하지 않는가?
- [X] 데이터베이스 연결이 정상인가?

---

## TypeScript/React 관련 문제

### 문제: JSX 태그에 'react/jsx-runtime' 모듈 경로가 필요하지만 찾을 수 없음

**에러 메시지:**

```
This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found.
Make sure you have types for the appropriate package installed.
```

**원인:**

- TypeScript가 React의 JSX 런타임 타입을 찾지 못함
- `tsconfig.json`의 `types` 배열에 React 타입이 명시되지 않음
- `jsxImportSource` 설정이 누락됨

**해결 방법:**

#### 1. tsconfig.app.json 수정

`front_end/tsconfig.app.json` 파일의 `compilerOptions`에 다음을 추가/수정:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "skipLibCheck": true
  }
}
```

**중요**: `types` 배열에 "react", "react-dom"을 명시적으로 추가하지 않아도 됩니다.
`skipLibCheck: true`가 설정되어 있으면 타입 체크를 건너뛰고,
`jsxImportSource: "react"`가 설정되어 있으면 React의 JSX 런타임을 올바르게 사용합니다.

#### 2. node_modules 설치 확인 및 재설치

**먼저 node_modules가 설치되어 있는지 확인:**

```bash
cd front_end
ls node_modules  # Linux/Mac
dir node_modules  # Windows
```

**설치되어 있지 않거나 오류가 있는 경우 재설치:**

터미널에서 다음 명령어 실행:

```bash
cd front_end
rm -rf node_modules package-lock.json
npm install
```

또는 Windows PowerShell:

```powershell
cd front_end
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

**중요**: `@types/react`와 `@types/react-dom`이 제대로 설치되었는지 확인:

```bash
npm list @types/react @types/react-dom
```

설치되어 있지 않으면:

```bash
npm install --save-dev @types/react @types/react-dom
```

#### 3. TypeScript 서버 재시작

VS Code나 IDE에서:

- `Ctrl + Shift + P` (또는 `Cmd + Shift + P` on Mac)
- "TypeScript: Restart TS Server" 실행

#### 4. 확인 사항

- `package.json`에 `@types/react`와 `@types/react-dom`이 `devDependencies`에 포함되어 있는지 확인
- React 버전과 `@types/react` 버전이 호환되는지 확인 (React 19는 `@types/react@^19.2.5` 필요)

**해결 완료 확인:**

- IDE에서 JSX 구문 오류가 사라짐
- `npm run build` 또는 `npm run dev` 실행 시 오류 없이 빌드됨
- 브라우저에서 React 앱이 정상적으로 렌더링됨

**참고**:

- `vite/client` 타입 오류가 나타나더라도 `skipLibCheck: true` 설정으로 인해 실제 빌드에는 영향을 주지 않습니다.
- `node_modules`가 설치되어 있으면 이 오류는 발생하지 않습니다.

---

## CORS 관련 문제

### 문제: 프론트엔드에서 API 호출 시 CORS 오류 발생

**에러 메시지:**

```
Access to XMLHttpRequest at 'http://localhost:8080/api/products' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**원인:**

- 백엔드 CORS 설정이 프론트엔드 도메인을 허용하지 않음
- Security 설정이 CORS를 차단함

**해결 방법:**

#### 1. CorsConfig 확인

`src/main/java/com/example/spm/global/config/CorsConfig.java` 파일 확인:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 개발 환경: 모든 origin 허용
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

#### 2. SecurityConfig 확인

`SecurityConfig`에서 CORS 필터가 적용되는지 확인:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ... 기타 설정
        return http.build();
    }
}
```

#### 3. 프론트엔드 API URL 확인

`front_end/src/services/api/productApi.ts`에서 API 베이스 URL 확인:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

환경 변수 설정 (`.env` 파일):

```
VITE_API_BASE_URL=http://localhost:8080
```

---

### 문제: TypeScript 모듈 export 오류 (런타임)

**에러 메시지:**

```
Uncaught SyntaxError: The requested module '/src/types/product.types.ts' does not provide an export named 'PagedProductResponse'
```

**원인:**

- Vite 개발 서버의 모듈 캐시 문제
- TypeScript 파일이 제대로 저장되지 않았을 수 있음
- 개발 서버가 변경사항을 인식하지 못함

**해결 방법:**

#### 1. Vite 개발 서버 재시작

개발 서버를 중지하고 다시 시작:

```bash
cd front_end
# Ctrl+C로 서버 중지 후
npm run dev
```

#### 2. Vite 캐시 삭제

```bash
cd front_end
rm -rf node_modules/.vite
npm run dev
```

또는 Windows PowerShell:

```powershell
cd front_end
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

#### 3. 브라우저 캐시 삭제

- 개발자 도구 (F12) 열기
- 네트워크 탭에서 "Disable cache" 체크
- 페이지 새로고침 (Ctrl + Shift + R)

#### 4. TypeScript 서버 재시작

VS Code나 IDE에서:

- `Ctrl + Shift + P` (또는 `Cmd + Shift + P` on Mac)
- "TypeScript: Restart TS Server" 실행

**참고:**

- 타입은 런타임에 존재하지 않으므로 TypeScript 컴파일 후에는 사라집니다
- 하지만 개발 서버에서 타입 정보를 확인하기 위해 Vite가 TypeScript 파일을 직접 처리합니다
- 캐시 문제로 인해 변경사항이 반영되지 않을 수 있습니다

---

### 문제: erasableSyntaxOnly로 인한 enum 사용 불가

**에러 메시지:**

```
This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

**원인:**

- `tsconfig.app.json`의 `erasableSyntaxOnly: true` 옵션이 enum 사용을 막음
- enum은 런타임 코드를 생성하므로 erasable syntax가 아님

**해결 방법:**

`tsconfig.app.json`에서 `erasableSyntaxOnly` 옵션 제거:

```json
{
  "compilerOptions": {
    // ... 기타 설정
    "erasableSyntaxOnly": true,  // 이 줄 제거
  }
}
```

**참고:**

- `erasableSyntaxOnly`는 타입만 허용하고 런타임 코드를 생성하는 구문(enum, namespace 등)을 차단합니다
- enum을 사용하려면 이 옵션을 제거해야 합니다

---

### 문제: verbatimModuleSyntax로 인한 타입 import 오류

**에러 메시지:**

```
'ProductRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**원인:**

- `tsconfig.app.json`의 `verbatimModuleSyntax: true` 옵션이 활성화되어 있음
- 타입만 사용하는 경우 `import type`을 사용해야 함
- `verbatimModuleSyntax`는 모듈 구문을 그대로 유지하여 타입과 값을 구분함

**해결 방법:**

#### 타입만 import하는 경우 `import type` 사용

```typescript
// 변경 전 (오류 발생)
import { ProductRequest, ProductResponse, PagedProductResponse } from '@/types/product.types';
import { PaginationParams } from '@/types/common.types';

// 변경 후 (정상 작동)
import type { ProductRequest, ProductResponse, PagedProductResponse } from '@/types/product.types';
import type { PaginationParams } from '@/types/common.types';
```

#### 타입과 값을 모두 사용하는 경우

enum이나 값도 함께 export하는 경우, 일반 import와 type import를 구분:

```typescript
// 타입만 사용
import type { ProductRequest, ProductResponse } from '@/types/product.types';

// 값도 사용 (enum 등)
import { ProductStatus } from '@/types/product.types';
```

**참고:**

- `verbatimModuleSyntax`는 TypeScript가 모듈 import/export 구문을 그대로 유지하도록 함
- 타입만 사용하는 경우 `import type`을 사용하면 런타임에 제거되어 번들 크기를 줄일 수 있음
- enum, class 등 런타임에 존재하는 값은 일반 `import` 사용

**적용 예시:**

- ✅ 타입만: `import type { ProductResponse } from '@/types/product.types';`
- ✅ 값도 사용: `import { ProductStatus } from '@/types/product.types';`
- ✅ 혼합:

  ```typescript
  import type { ProductRequest, ProductResponse } from '@/types/product.types';
  import { ProductStatus } from '@/types/product.types';
  ```

---

## Spring Boot/백엔드 관련 문제

### 문제: spring-boot-starter-aop를 찾을 수 없음

**에러 메시지:**

```
Could not find org.springframework.boot:spring-boot-starter-aop:.
```

**원인:**

- Spring Boot 4.0에서는 `spring-boot-starter-aop`가 `spring-boot-starter-aspectj`로 변경됨
- 의존성 이름이 변경되어 기존 이름으로는 찾을 수 없음

**해결 방법:**

#### build.gradle 수정

`build.gradle` 파일에서 의존성 이름을 변경:

```gradle
// 변경 전
implementation 'org.springframework.boot:spring-boot-starter-aop'

// 변경 후 (Spring Boot 4.0)
implementation 'org.springframework.boot:spring-boot-starter-aspectj'
```

**참고:**

- Spring Boot 4.0에서는 AOP 기능이 `spring-boot-starter-aspectj`로 통합됨
- AspectJ를 사용하는 경우에만 이 의존성이 필요함
- 기능은 동일하게 작동함

---

### 문제: JSON 직렬화 라이브러리 변경 (Jackson → Gson)

**변경 사항:**

- Jackson 대신 Gson을 사용하여 JSON 직렬화 처리
- `LoggingAspect`에서 `ObjectMapper` 대신 `Gson` 사용

**해결 방법:**

#### build.gradle에 Gson 의존성 추가

`build.gradle` 파일에서 Jackson 의존성을 제거하고 Gson 추가:

```gradle
// 변경 전
implementation 'org.springframework.boot:spring-boot-starter-json'
implementation 'com.fasterxml.jackson.core:jackson-databind'

// 변경 후
implementation 'com.google.code.gson:gson'
```

#### LoggingAspect 수정

```java
// 변경 전
import com.fasterxml.jackson.databind.ObjectMapper;
private final ObjectMapper objectMapper;
String resultStr = objectMapper.writeValueAsString(result);

// 변경 후
import com.google.gson.Gson;
private final Gson gson;
String resultStr = gson.toJson(result);
```

#### Gson Bean 설정

Spring Boot가 Gson Bean을 자동으로 생성하므로, `@RequiredArgsConstructor`로 주입 가능합니다.
필요한 경우 명시적으로 Bean을 생성할 수 있습니다:

```java
@Configuration
public class GsonConfig {
    @Bean
    public Gson gson() {
        return new Gson();
    }
}
```

**참고:**

- Gson은 Jackson보다 가볍고 단순한 API 제공
- `toJson()` 메서드로 객체를 JSON 문자열로 변환
- Spring Boot는 자동으로 `Gson` Bean을 생성하므로 별도 설정 불필요

---

### 문제: WebRequest.getParameterNames() 타입 불일치

**에러 메시지:**

```
error: incompatible types: Iterator<String> cannot be converted to String[]
```

**원인:**

- Spring Boot 4.0 / Jakarta EE에서 `WebRequest.getParameterNames()`의 반환 타입이 `Iterator<String>`으로 변경됨
- 기존 코드에서 `String[]`로 받으려고 해서 타입 불일치 발생

**해결 방법:**

#### GlobalExceptionHandler 수정

```java
// 변경 전
String[] paramNames = request.getParameterNames();
if (paramNames != null && paramNames.length > 0) {
    for (String paramName : paramNames) {
        // ...
    }
}

// 변경 후
import java.util.Iterator;

Iterator<String> paramNames = request.getParameterNames();
if (paramNames != null && paramNames.hasNext()) {
    while (paramNames.hasNext()) {
        String paramName = paramNames.next();
        // ...
    }
}
```

**참고:**

- `Iterator`는 한 번만 순회 가능하므로 `hasNext()`로 체크 후 `next()`로 값을 가져옴
- `Iterator`는 null일 수 있으므로 null 체크 필요

---

### 문제: 테스트 실패 - NoSuchBeanDefinitionException

**에러 메시지:**

```
SpringReactProductMngApplicationTests > contextLoads() FAILED
    java.lang.IllegalStateException at DefaultCacheAwareContextLoaderDelegate.java:195
        Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException at ConstructorResolver.java:804
            Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException at DefaultListableBeanFactory.java:2297
```

**원인:**

- `@SpringBootTest`가 전체 Spring 컨텍스트를 로드하려고 할 때 데이터베이스 연결 실패
- 테스트 환경에서 MySQL 데이터베이스가 없거나 연결할 수 없음
- JPA 관련 Bean들이 데이터베이스 연결에 의존하여 생성되지 않음

**해결 방법:**

#### 1. build.gradle에 H2 테스트 의존성 추가

`build.gradle` 파일에 H2 인메모리 데이터베이스 추가:

```gradle
dependencies {
    // ... 기타 의존성

    // DB & JPA
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.mysql:mysql-connector-j' // MySQL 사용 시
    testRuntimeOnly 'com.h2database:h2' // 테스트용 인메모리 DB (추가)
}
```

#### 2. 테스트용 application.properties 생성

`src/test/resources/application.properties` 파일 생성:

```properties
# 테스트 환경 설정
spring.application.name=spring-react-product-mng-test

# 테스트용 인메모리 H2 데이터베이스 사용
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate 설정 - 테스트용으로 자동 스키마 생성
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
spring.jpa.properties.hibernate.format_sql=false

# H2 콘솔 비활성화 (필요시 true로 변경 가능)
spring.h2.console.enabled=false

# Logging 설정
logging.level.root=WARN
logging.level.com.example.spm=DEBUG
logging.level.org.springframework.web=WARN
logging.level.org.hibernate.SQL=false
```

#### 3. 테스트 클래스 확인

테스트 클래스가 정상적으로 설정되어 있는지 확인:

```java
package com.example.spm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Spring Boot 애플리케이션 컨텍스트 로드 테스트
 * 테스트용 H2 인메모리 데이터베이스 사용
 */
@SpringBootTest
class SpringReactProductMngApplicationTests {

    @Test
    void contextLoads() {
        // 컨텍스트가 정상적으로 로드되는지 확인
    }

}
```

**참고:**

- `src/test/resources/application.properties`는 테스트 실행 시 자동으로 사용됨
- H2 인메모리 데이터베이스는 테스트 실행 시 자동으로 생성되고 종료 시 삭제됨
- 실제 운영 환경(MySQL)과 테스트 환경(H2)을 분리하여 독립적인 테스트 가능
- `spring.jpa.hibernate.ddl-auto=create-drop`은 테스트 시작 시 스키마를 생성하고 종료 시 삭제함

**확인:**

```bash
.\gradlew clean test
```

테스트가 성공적으로 통과하면 해결 완료입니다.

---

## 빌드 관련 문제

**에러 메시지:**

```
Execution failed for task ':compileJava'
```

**해결 방법:**

#### 1. Gradle 캐시 정리

```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

#### 2. QueryDSL 생성 확인

QueryDSL Q 클래스가 생성되지 않은 경우:

```bash
./gradlew clean
./gradlew compileJava
```

생성된 파일 확인: `build/generated/querydsl/`

#### 3. Java 버전 확인

`build.gradle`에서 Java 버전 확인:

```gradle
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

시스템 Java 버전 확인:

```bash
java -version
```

---

## 프론트엔드 빌드 문제

### 문제: Vite 빌드 실패

**에러 메시지:**

```
Failed to resolve import
```

**해결 방법:**

#### 1. 의존성 재설치

```bash
cd front_end
rm -rf node_modules package-lock.json
npm install
```

#### 2. Vite 캐시 정리

```bash
cd front_end
rm -rf node_modules/.vite
npm run dev
```

#### 3. TypeScript 타입 확인

```bash
cd front_end
npm run build
```

타입 오류가 있으면 수정 후 재빌드

---

## 데이터베이스 연결 문제

### 문제: 데이터베이스 연결 실패

**에러 메시지:**

```
Communications link failure
```

**해결 방법:**

#### 1. application.properties 확인

`src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/product_mng
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

#### 2. 데이터베이스 서버 실행 확인

MySQL이 실행 중인지 확인:

```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

#### 3. 데이터베이스 생성

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

#### 1. 사용 중인 포트 확인

Windows:

```powershell
netstat -ano | findstr :8080
```

Linux/Mac:

```bash
lsof -i :8080
```

#### 2. 프로세스 종료

Windows:

```powershell
taskkill /PID <PID> /F
```

Linux/Mac:

```bash
kill -9 <PID>
```

#### 3. 포트 변경

`application.properties`:

```properties
server.port=8081
```

## 추가 도움말

문제가 지속되면:

1. 이 문서의 관련 섹션을 다시 확인
2. 프로젝트의 `README.md` 확인
3. 관련 기술 문서 참조:
   - [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
   - [React 공식 문서](https://react.dev)
   - [TypeScript 공식 문서](https://www.typescriptlang.org)
   - [Vite 공식 문서](https://vitejs.dev)

---

## 빌드 관련 문제

### 문제: spring-boot-starter-aop를 찾을 수 없음

**에러 메시지:**

```
Could not find org.springframework.boot:spring-boot-starter-aop:.
```

**원인:**

- Spring Boot 4.0에서는 `spring-boot-starter-aop`가 `spring-boot-starter-aspectj`로 변경됨
- 의존성 이름이 변경되어 기존 이름으로는 찾을 수 없음

**해결 방법:**

#### build.gradle 수정

`build.gradle` 파일에서 의존성 이름을 변경:

```gradle
// 변경 전
implementation 'org.springframework.boot:spring-boot-starter-aop'

// 변경 후 (Spring Boot 4.0)
implementation 'org.springframework.boot:spring-boot-starter-aspectj'
```

**참고:**

- Spring Boot 4.0에서는 AOP 기능이 `spring-boot-starter-aspectj`로 통합됨
- AspectJ를 사용하는 경우에만 이 의존성이 필요함
- 기능은 동일하게 작동함

---

### 문제: JSON 직렬화 라이브러리 변경 (Jackson → Gson)

**변경 사항:**

- Jackson 대신 Gson을 사용하여 JSON 직렬화 처리
- `LoggingAspect`에서 `ObjectMapper` 대신 `Gson` 사용

**해결 방법:**

#### build.gradle에 Gson 의존성 추가

`build.gradle` 파일에서 Jackson 의존성을 제거하고 Gson 추가:

```gradle
// 변경 전
implementation 'org.springframework.boot:spring-boot-starter-json'
implementation 'com.fasterxml.jackson.core:jackson-databind'

// 변경 후
implementation 'com.google.code.gson:gson'
```

#### LoggingAspect 수정

```java
// 변경 전
import com.fasterxml.jackson.databind.ObjectMapper;
private final ObjectMapper objectMapper;
String resultStr = objectMapper.writeValueAsString(result);

// 변경 후
import com.google.gson.Gson;
private final Gson gson;
String resultStr = gson.toJson(result);
```

#### Gson Bean 설정

Spring Boot가 Gson Bean을 자동으로 생성하므로, `@RequiredArgsConstructor`로 주입 가능합니다.
필요한 경우 명시적으로 Bean을 생성할 수 있습니다:

```java
@Configuration
public class GsonConfig {
    @Bean
    public Gson gson() {
        return new Gson();
    }
}
```

**참고:**

- Gson은 Jackson보다 가볍고 단순한 API 제공
- `toJson()` 메서드로 객체를 JSON 문자열로 변환
- Spring Boot는 자동으로 `Gson` Bean을 생성하므로 별도 설정 불필요

---

### 문제: WebRequest.getParameterNames() 타입 불일치

**에러 메시지:**

```
error: incompatible types: Iterator<String> cannot be converted to String[]
```

**원인:**

- Spring Boot 4.0 / Jakarta EE에서 `WebRequest.getParameterNames()`의 반환 타입이 `Iterator<String>`으로 변경됨
- 기존 코드에서 `String[]`로 받으려고 해서 타입 불일치 발생

**해결 방법:**

#### GlobalExceptionHandler 수정

```java
// 변경 전
String[] paramNames = request.getParameterNames();
if (paramNames != null && paramNames.length > 0) {
    for (String paramName : paramNames) {
        // ...
    }
}

// 변경 후
import java.util.Iterator;

Iterator<String> paramNames = request.getParameterNames();
if (paramNames != null && paramNames.hasNext()) {
    while (paramNames.hasNext()) {
        String paramName = paramNames.next();
        // ...
    }
}
```

**참고:**

- `Iterator`는 한 번만 순회 가능하므로 `hasNext()`로 체크 후 `next()`로 값을 가져옴
- `Iterator`는 null일 수 있으므로 null 체크 필요

---

## 문제 해결 이력

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

---

## Cinema App 프로젝트 관련 문제

### 문제: QueryDSL Q클래스 "The type Q... is already defined" 중복 정의

**에러 메시지:**

```
The type QMember is already defined
The type QMovie is already defined
... (QPayment, QReservation, QScreen, QScreening, QSeat 등)
```

**발생 경로 예:**

- `bin\generated-sources\annotations\com\cinema\domain\...\entity\Q*.java`

**원인:**

- Gradle은 `build/generated/querydsl`에 Q클래스를 생성하고, IDE(Eclipse/일부 Java 확장)는 `bin/generated-sources/annotations`에 별도로 생성함
- 두 경로가 모두 소스/클래스패스에 포함되면 같은 Q 타입이 두 번 정의되어 "already defined" 발생

**해결 방법:**

1. **`bin` 폴더 삭제**  
   로컬에 있는 `bin` 폴더를 삭제해 IDE가 만든 생성소스만 제거합니다.

   ```powershell
   # 프로젝트 루트에서
   Remove-Item -Recurse -Force bin -ErrorAction SilentlyContinue
   ```

2. **Gradle로만 빌드**  
   Q클래스는 Gradle의 `compileJava` 결과인 `build/generated/querydsl`만 사용해야 합니다.

   ```powershell
   .\gradlew clean compileJava
   ```

3. **IDE에서 Gradle 사용**
   - **Cursor/VS Code**: `Ctrl+Shift+P` → **"Java: Clean Java Language Server Workspace"** 실행 후 창 새로고침. 빌드는 Gradle 뷰에서 "Build" 또는 "compileJava" 사용.
   - IntelliJ: "Build → Rebuild Project" 시 Gradle 사용, 또는 "Use Gradle for build" 옵션 사용.
   - Eclipse: `.\gradlew eclipse` 후 프로젝트 다시 import하면 `.classpath`가 `build/generated/querydsl`을 참조.

4. **`bin`이 다시 생기지 않게**  
   `bin/`은 `.gitignore`에 들어 있음. `.vscode/settings.json`에 `java.import.exclusions`로 `bin`을 Java 임포트에서 제외해 두었으므로, "Java: Clean Java Language Server Workspace" 후에는 `bin`이 클래스패스에 들어오지 않도록 할 수 있음.

**참고:**

- 이 프로젝트의 Q클래스 생성 위치는 `build.gradle`의 `querydslDir` = `build/generated/querydsl` 하나뿐입니다.

---

### 문제: Vite 개발 서버에서 의존성 해석 실패 (react-router-dom, clsx 등)

**에러 메시지:**

```
Could not resolve "react-router-dom"
Could not resolve "clsx"
```

**원인:**

- `package.json`에 선언은 되어 있으나 `node_modules`에 실제로 설치되지 않음
- `npm install`을 하지 않았거나, 중간에 의존성이 추가된 후 설치를 건너뜀

**해결 방법:**

프론트엔드 디렉토리에서 의존성 재설치:

```bash
cd frontend
npm install
```

또는 Windows PowerShell:

```powershell
cd frontend
npm install
```

그 후 개발 서버 재시작:

```bash
npm run dev
```

**참고:**

- 프로젝트 루트가 아닌 `frontend/` 디렉터리에서 실행해야 함
- `package-lock.json`이 있으면 버전이 고정되어 일관된 설치가 가능함

---

### 문제: CSS가 적용되지 않는 것처럼 보이는 현상 (Tailwind 미로드)

**증상:**

- 버튼·레이아웃 등 Tailwind 클래스가 적용되지 않은 것처럼 보임
- 개발자 도구에서 해당 클래스가 인식되지 않음

**원인:**

- Tailwind CSS를 불러오는 진입점이 없음
- `main.tsx`에서 전역 CSS를 import하지 않았거나, Tailwind용 CSS 파일이 없음

**해결 방법:**

#### 1. Tailwind 진입 CSS 파일 생성

`frontend/src/index.css` 파일을 만들고 다음을 추가:

```css
@import "tailwindcss";
```

(또는 사용 중인 Tailwind 버전에 맞게 `@tailwind base; @tailwind components; @tailwind utilities;` 등 사용)

#### 2. main.tsx에서 전역 CSS import

`frontend/src/main.tsx` 최상단에 추가:

```tsx
import '@/index.css';
```

그 후 개발 서버를 재시작하여 확인.

**참고:**

- Vite + Tailwind 4 구성에서는 `@import "tailwindcss";` 형태를 사용할 수 있음
- Tailwind 3 이하일 경우 `tailwind.config.js`와 `@tailwind` 디렉티브 조합 확인

---

### 문제: Redisson Spring Boot 스타터로 인한 ApplicationContext 기동 실패 (Spring Boot 4)

**에러 메시지:**

```
Application run failed
java.lang.IllegalStateException: Failed to generate bean name for imported class 'org.redisson.spring.starter.RedissonAutoConfigurationV2'
	...
Caused by: java.lang.ClassNotFoundException: org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
```

**원인:**

- `redisson-spring-boot-starter`(3.40.x)는 **Spring Boot 3** 기준으로 빌드되어, 내부에서 `org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration`을 참조합니다.
- **Spring Boot 4.x**에서는 자동 설정 모듈 구조/패키지가 바뀌어 위 클래스를 찾지 못해 `ClassNotFoundException`이 발생합니다.
- 이 프로젝트는 이미 `RedissonConfig`에서 `RedissonClient` 빈을 수동 등록하고 있어, 스타터의 자동 설정은 필수가 아닙니다.

**해결 방법:**

#### build.gradle 수정

`redisson-spring-boot-starter` 대신 **Redisson 코어만** 사용하도록 변경합니다.

```gradle
// 변경 전 (Spring Boot 4에서 오류 발생)
implementation 'org.redisson:redisson-spring-boot-starter:3.40.2'

// 변경 후
implementation 'org.redisson:redisson:3.40.2'
```

- `RedissonConfig`(`RedissonClient` 빈 수동 등록)와 `application.yml`의 `redisson.single-server-config.*` 설정은 그대로 두면 됩니다.
- 분산 락 등 기존 Redisson 사용 방식은 동일하게 동작합니다.

**참고:**

- Spring Boot 4 전용 Redisson 스타터(예: 4.1.x)가 나온다면, 호환 버전으로 스타터를 다시 사용하는 방법도 있습니다.
- 현재는 “스타터 제거 + 코어만 사용”이 가장 안정적인 우회 방법입니다.

---

### 문제: Spring Boot 4.0.2에서 spring-boot-starter-aop 찾을 수 없음

**에러 메시지:**

```
Could not find org.springframework.boot:spring-boot-starter-aop:.
```

**원인:**

- Spring Boot 4.0.2가 Maven Central에 아직 없을 수 있음
- Spring Milestone Repository가 필요함

**해결 방법:**

#### build.gradle 수정

```gradle
repositories {
    mavenCentral()
    // Spring Milestone Repository 추가
    maven { url 'https://repo.spring.io/milestone' }
}

dependencies {
    // AOP - Spring AOP + AspectJ 직접 추가
    implementation 'org.springframework:spring-aop'
    implementation 'org.aspectj:aspectjweaver'
}
```

---

### 문제: 패키지 구조 중복 (screen vs screening)

**원인:**

- `domain/screen` 패키지와 `domain/screening` 패키지가 혼재
- Entity 정의가 중복됨

**해결 방법:**

1. `domain/screen` 패키지의 파일들 삭제
2. `domain/screening` 패키지로 통합
3. DDD 원칙에 따라 Aggregate Root(Screening) 중심으로 구조화

**변경된 패키지 구조:**

```
domain/
├── member/           # 회원 도메인
├── movie/            # 영화 도메인
├── theater/          # 영화관 도메인
├── screening/        # 상영 도메인 (Aggregate Root)
│   ├── entity/
│   │   ├── Screening.java      # Aggregate Root
│   │   ├── Screen.java
│   │   ├── Seat.java
│   │   ├── ScreeningSeat.java
│   │   └── (Enum 파일들)
│   └── repository/
├── reservation/      # 예매 도메인
└── payment/          # 결제 도메인
```

---

### 문제: JPA Entity에서 Lazy Loading 관련 N+1 문제

**원인:**

- `@ManyToOne(fetch = FetchType.LAZY)` 설정 시 연관 엔티티 조회에서 N+1 쿼리 발생

**해결 방법:**

Repository에서 Fetch Join 사용:

```java
@Query("SELECT s FROM Screening s " +
       "JOIN FETCH s.movie " +
       "JOIN FETCH s.screen " +
       "WHERE s.id = :id")
Optional<Screening> findByIdWithMovieAndScreen(@Param("id") Long id);
```

---

### 문제: SeatStatus Enum 7단계 정의

**RULE.md 4.1에 따른 좌석 상태 정의:**

```java
public enum SeatStatus {
    AVAILABLE,        // 예매 가능
    HOLD,             // 임시 점유
    PAYMENT_PENDING,  // PG 요청 중
    RESERVED,         // 결제 완료
    CANCELLED,        // 예매 취소
    BLOCKED,          // 운영 차단
    DISABLED          // 물리적 사용 불가
}
```

**상태 전이 규칙:**

- AVAILABLE → HOLD (좌석 선택)
- HOLD → PAYMENT_PENDING (결제 시작)
- PAYMENT_PENDING → RESERVED (결제 성공)
- PAYMENT_PENDING → AVAILABLE (결제 실패)
- RESERVED → CANCELLED (예매 취소)
- 관리자 설정: BLOCKED, DISABLED

---

### 경고: WebMvcConfigurer.configureMessageConverters deprecated

**경고 메시지:**

```
warning: [removal] configureMessageConverters(List<HttpMessageConverter<?>>) in WebMvcConfigurer has been deprecated and marked for removal
```

**원인:**

- Spring Boot 4.0에서 `configureMessageConverters` 메서드가 deprecated됨
- 향후 버전에서 제거 예정

**현재 상태:**

- 기능은 정상 작동함
- 추후 `extendMessageConverters` 또는 다른 방식으로 마이그레이션 필요

**향후 해결 방안:**

1. `HttpMessageConverters` Bean 등록 방식으로 변경
2. 또는 Spring Boot 공식 마이그레이션 가이드 참조

```java
// 대안 예시
@Bean
public HttpMessageConverters customConverters(Gson gson) {
    GsonHttpMessageConverter gsonConverter = new GsonHttpMessageConverter();
    gsonConverter.setGson(gson);
    return new HttpMessageConverters(gsonConverter);
}
```

---

### 문제: screen 패키지와 screening 패키지 충돌

**원인:**

- 기존 `domain/screen` 패키지와 새로운 `domain/screening` 패키지가 혼재
- import 경로 불일치로 컴파일 오류 발생

**해결 방법:**

1. `domain/screen` 패키지의 모든 파일 삭제
2. `domain/screening` 패키지로 통합
3. 기존 import 경로를 새 경로로 수정:

```java
// 변경 전
import com.cinema.domain.screen.entity.Screen;
import com.cinema.domain.screen.entity.Screening;

// 변경 후
import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.entity.Screening;
```

---

### 문제: 도메인 예외 처리 불일치

**원인:**

- Entity의 비즈니스 메서드에서 `IllegalStateException`, `IllegalArgumentException` 등 Java 기본 예외 사용
- API 응답에서 일관된 에러 코드 및 메시지 제공 어려움
- 예외 로깅 시 컨텍스트 정보 부족

**해결 방법:**

#### 1. 도메인별 예외 클래스 생성

```java
// 결제 예외
public class PaymentException extends BusinessException {
    private final Long paymentId;
    private final Long reservationId;
    // ...
}

// 예매 예외
public class ReservationException extends BusinessException {
    private final Long reservationId;
    private final String reservationNo;
    // ...
}

// 상영 스케줄 예외
public class ScreeningException extends BusinessException {
    private final Long screeningId;
    // ...
}

// 회원 예외
public class MemberException extends BusinessException {
    private final Long memberId;
    private final String loginId;
    // ...
}
```

#### 2. ErrorCode에 세부 코드 추가

```java
// 상영 스케줄 관련
SCREENING_CANNOT_START(HttpStatus.BAD_REQUEST, "SCREENING_004", "상영을 시작할 수 없는 상태입니다."),
SCREENING_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, "SCREENING_005", "상영을 취소할 수 없는 상태입니다."),
SCREENING_NOT_BOOKABLE(HttpStatus.BAD_REQUEST, "SCREENING_006", "예매 가능한 상영이 아닙니다."),

// 예매 관련
RESERVATION_CANNOT_START_PAYMENT(HttpStatus.BAD_REQUEST, "RESERVATION_004", "결제를 시작할 수 없는 상태입니다."),
RESERVATION_CANNOT_CONFIRM(HttpStatus.BAD_REQUEST, "RESERVATION_005", "예매를 확정할 수 없는 상태입니다."),
RESERVATION_CANNOT_REFUND(HttpStatus.BAD_REQUEST, "RESERVATION_006", "환불할 수 없는 상태입니다."),

// 결제 관련
PAYMENT_CANNOT_COMPLETE(HttpStatus.BAD_REQUEST, "PAYMENT_005", "결제를 완료할 수 없는 상태입니다."),
PAYMENT_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, "PAYMENT_006", "결제를 취소할 수 없는 상태입니다."),
PAYMENT_CANNOT_REFUND(HttpStatus.BAD_REQUEST, "PAYMENT_007", "환불할 수 없는 상태입니다."),
```

#### 3. Entity에서 공통 예외 사용

```java
// 변경 전
public void cancel() {
    if (this.payStatus != PaymentStatus.SUCCESS) {
        throw new IllegalStateException("취소할 수 없는 결제 상태입니다. 현재 상태: " + this.payStatus);
    }
    // ...
}

// 변경 후
public void cancel() {
    if (this.payStatus != PaymentStatus.SUCCESS) {
        throw new PaymentException(ErrorCode.PAYMENT_CANNOT_CANCEL,
                String.format("paymentId=%d, 현재 상태: %s", this.id, this.payStatus));
    }
    // ...
}
```

#### 4. GlobalExceptionHandler에 핸들러 추가

```java
@ExceptionHandler(PaymentException.class)
public ResponseEntity<ErrorResponse> handlePaymentException(PaymentException e) {
    log.warn("[PaymentException] code={}, paymentId={}, reservationId={}, message={}",
            e.getErrorCode().getCode(), e.getPaymentId(), e.getReservationId(), e.getMessage());
    return ErrorResponse.of(e.getErrorCode(), e.getMessage());
}
```

**장점:**

- API 응답에서 일관된 에러 코드 제공
- 예외 로깅 시 컨텍스트 정보(ID 등) 포함
- 클라이언트에서 에러 코드 기반 처리 가능
- 도메인별 예외 분리로 코드 가독성 향상

---

### 문제: front_end에서 gradle 명령어 실행 오류

**에러 메시지:**

```
Project directory 'C:\workspace\spring-react-product-mng\front_end' is not part of the build defined by settings file 'C:\workspace\spring-react-product-mng\settings.gradle'.
```

**원인:**

- `front_end` 디렉토리는 npm 프로젝트이므로 Gradle 명령어를 사용할 수 없음
- Gradle은 백엔드 프로젝트용 빌드 도구
- `front_end`는 Vite/npm 기반 프론트엔드 프로젝트

**해결 방법:**

#### 1. 백엔드 빌드 (Gradle)

백엔드를 빌드하려면 **프로젝트 루트 디렉토리**에서 실행:

```bash
# 프로젝트 루트 디렉토리로 이동
cd C:\workspace\spring-react-product-mng

# Gradle 빌드 실행
.\gradlew clean build
```

또는 Windows PowerShell:

```powershell
cd C:\workspace\spring-react-product-mng
.\gradlew clean build
```

#### 2. 프론트엔드 빌드 (npm)

프론트엔드를 빌드하려면 **front_end 디렉토리**에서 npm 명령어 사용:

```bash
# front_end 디렉토리로 이동
cd front_end

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

#### 3. 프로젝트 구조 확인

```
spring-react-product-mng/
├── build.gradle          # 백엔드 빌드 설정 (Gradle)
├── settings.gradle       # Gradle 프로젝트 설정
├── src/                  # 백엔드 소스 코드
│   └── main/java/...
└── front_end/            # 프론트엔드 프로젝트 (npm)
    ├── package.json      # npm 프로젝트 설정
    ├── vite.config.ts    # Vite 빌드 설정
    └── src/              # 프론트엔드 소스 코드
```

**참고:**

- 백엔드: Gradle 사용 (`build.gradle`, `settings.gradle`)
- 프론트엔드: npm/Vite 사용 (`package.json`, `vite.config.ts`)
- 각각 독립적인 빌드 시스템을 사용하므로 해당 디렉토리에서 올바른 명령어를 사용해야 함

---

### 문제: TypeScript 모듈 export 오류 (런타임)

**에러 메시지:**

```
Uncaught SyntaxError: The requested module '/src/types/product.types.ts' does not provide an export named 'PagedProductResponse'
```

**원인:**

- Vite 개발 서버의 모듈 캐시 문제
- TypeScript 파일이 제대로 저장되지 않았을 수 있음
- 개발 서버가 변경사항을 인식하지 못함

**해결 방법:**

#### 1. Vite 개발 서버 재시작

개발 서버를 중지하고 다시 시작:

```bash
cd front_end
# Ctrl+C로 서버 중지 후
npm run dev
```

#### 2. Vite 캐시 삭제

```bash
cd front_end
rm -rf node_modules/.vite
npm run dev
```

또는 Windows PowerShell:

```powershell
cd front_end
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

#### 3. 브라우저 캐시 삭제

- 개발자 도구 (F12) 열기
- 네트워크 탭에서 "Disable cache" 체크
- 페이지 새로고침 (Ctrl + Shift + R)

#### 4. TypeScript 서버 재시작

VS Code나 IDE에서:

- `Ctrl + Shift + P` (또는 `Cmd + Shift + P` on Mac)
- "TypeScript: Restart TS Server" 실행

**참고:**

- 타입은 런타임에 존재하지 않으므로 TypeScript 컴파일 후에는 사라집니다
- 하지만 개발 서버에서 타입 정보를 확인하기 위해 Vite가 TypeScript 파일을 직접 처리합니다
- 캐시 문제로 인해 변경사항이 반영되지 않을 수 있습니다

---

### 문제: erasableSyntaxOnly로 인한 enum 사용 불가

**에러 메시지:**

```
This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

**원인:**

- `tsconfig.app.json`의 `erasableSyntaxOnly: true` 옵션이 enum 사용을 막음
- enum은 런타임 코드를 생성하므로 erasable syntax가 아님

**해결 방법:**

`tsconfig.app.json`에서 `erasableSyntaxOnly` 옵션 제거:

```json
{
  "compilerOptions": {
    // ... 기타 설정
    "erasableSyntaxOnly": true,  // 이 줄 제거
  }
}
```

**참고:**

- `erasableSyntaxOnly`는 타입만 허용하고 런타임 코드를 생성하는 구문(enum, namespace 등)을 차단합니다
- enum을 사용하려면 이 옵션을 제거해야 합니다

---

## 설정 가이드

### TypeScript Import Path Alias 설정

TypeScript에서 `@/` alias를 사용하여 import 경로를 간소화할 수 있습니다.

#### 설정 방법

##### 1. TypeScript 설정 (`tsconfig.app.json`)

`tsconfig.app.json` 파일의 `compilerOptions`에 다음 설정 추가:

```json
{
  "compilerOptions": {
    // ... 기타 설정

    /* Path alias */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**설명:**

- `baseUrl: "."`: 프로젝트 루트를 기준으로 설정
- `paths: { "@/*": ["./src/*"] }`: `@/`로 시작하는 import를 `./src/`로 매핑

##### 2. Vite 설정 (`vite.config.ts`)

Vite에서도 동일한 alias를 설정해야 런타임에서 정상 작동합니다:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**설명:**

- `path` 모듈을 import하여 경로를 절대 경로로 변환
- `resolve.alias`에 `'@': path.resolve(__dirname, './src')` 설정

##### 3. Import 경로 변경 예시

**변경 전 (상대 경로):**

```typescript
import { ProductResponse } from '../../types/product.types';
import { getProducts } from '../services/api/productApi';
import { formatDate } from '../../utils/dateUtils';
```

**변경 후 (Path alias):**

```typescript
import { ProductResponse } from '@/types/product.types';
import { getProducts } from '@/services/api/productApi';
import { formatDate } from '@/utils/dateUtils';
```

#### 적용된 파일 목록

다음 파일들의 import 경로가 path alias로 변경되었습니다:

- `src/services/api/productApi.ts`
- `src/pages/HomePage.tsx`
- `src/pages/ProductListPage.tsx`
- `src/components/product/ProductCard.tsx`
- `src/components/product/ProductForm.tsx`
- `src/components/product/ProductSearch.tsx`
- `src/App.tsx`

#### 주의 사항

1. **같은 폴더 내 파일**: 같은 폴더 내의 파일은 `./`를 사용하는 것이 일반적입니다.

   ```typescript
   // ✅ 같은 폴더 내
   import { Header } from './Header';
   import { Modal } from './Modal';

   // ✅ 다른 폴더로 이동
   import { ProductResponse } from '@/types/product.types';
   ```
2. **IDE 자동완성**: IDE(VS Code 등)에서 TypeScript 서버를 재시작하면 자동완성이 정상 작동합니다.

   - `Ctrl + Shift + P` → "TypeScript: Restart TS Server"
3. **빌드 확인**: 설정 후 빌드가 정상적으로 되는지 확인:

   ```bash
   npm run build
   ```

#### 장점

- **가독성 향상**: 상대 경로(`../../`)보다 명확하고 읽기 쉬움
- **리팩토링 안정성**: 파일을 이동해도 import 경로 수정이 적음
- **일관성**: 프로젝트 전반에서 일관된 import 스타일 유지

#### 문제 해결

Path alias가 작동하지 않는 경우:

1. **TypeScript 서버 재시작**

   - `Ctrl + Shift + P` → "TypeScript: Restart TS Server"
2. **Vite 개발 서버 재시작**

   ```bash
   # Ctrl+C로 중지 후
   npm run dev
   ```
3. **캐시 삭제**

   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite
   npm run dev
   ```
4. **설정 확인**

   - `tsconfig.app.json`에 `baseUrl`과 `paths` 설정이 있는지 확인
   - `vite.config.ts`에 `resolve.alias` 설정이 있는지 확인

---

### 문제: verbatimModuleSyntax로 인한 타입 import 오류

**에러 메시지:**

```
'ProductRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**원인:**

- `tsconfig.app.json`의 `verbatimModuleSyntax: true` 옵션이 활성화되어 있음
- 타입만 사용하는 경우 `import type`을 사용해야 함
- `verbatimModuleSyntax`는 모듈 구문을 그대로 유지하여 타입과 값을 구분함

**해결 방법:**

#### 타입만 import하는 경우 `import type` 사용

```typescript
// 변경 전 (오류 발생)
import { ProductRequest, ProductResponse, PagedProductResponse } from '@/types/product.types';
import { PaginationParams } from '@/types/common.types';

// 변경 후 (정상 작동)
import type { ProductRequest, ProductResponse, PagedProductResponse } from '@/types/product.types';
import type { PaginationParams } from '@/types/common.types';
```

#### 타입과 값을 모두 사용하는 경우

enum이나 값도 함께 export하는 경우, 일반 import와 type import를 구분:

```typescript
// 타입만 사용
import type { ProductRequest, ProductResponse } from '@/types/product.types';

// 값도 사용 (enum 등)
import { ProductStatus } from '@/types/product.types';
```

**참고:**

- `verbatimModuleSyntax`는 TypeScript가 모듈 import/export 구문을 그대로 유지하도록 함
- 타입만 사용하는 경우 `import type`을 사용하면 런타임에 제거되어 번들 크기를 줄일 수 있음
- enum, class 등 런타임에 존재하는 값은 일반 `import` 사용

**적용 예시:**

- ✅ 타입만: `import type { ProductResponse } from '@/types/product.types';`
- ✅ 값도 사용: `import { ProductStatus } from '@/types/product.types';`
- ✅ 혼합:

  ```typescript
  import type { ProductRequest, ProductResponse } from '@/types/product.types';
  import { ProductStatus } from '@/types/product.types';
  ```

---

### 문제: 테스트 실패 - NoSuchBeanDefinitionException

**에러 메시지:**

```
SpringReactProductMngApplicationTests > contextLoads() FAILED
    java.lang.IllegalStateException at DefaultCacheAwareContextLoaderDelegate.java:195
        Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException at ConstructorResolver.java:804
            Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException at DefaultListableBeanFactory.java:2297
```

**원인:**

- `@SpringBootTest`가 전체 Spring 컨텍스트를 로드하려고 할 때 데이터베이스 연결 실패
- 테스트 환경에서 MySQL 데이터베이스가 없거나 연결할 수 없음
- JPA 관련 Bean들이 데이터베이스 연결에 의존하여 생성되지 않음

**해결 방법:**

#### 1. build.gradle에 H2 테스트 의존성 추가

`build.gradle` 파일에 H2 인메모리 데이터베이스 추가:

```gradle
dependencies {
    // ... 기타 의존성

    // DB & JPA
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.mysql:mysql-connector-j' // MySQL 사용 시
    testRuntimeOnly 'com.h2database:h2' // 테스트용 인메모리 DB (추가)
}
```

#### 2. 테스트용 application.properties 생성

`src/test/resources/application.properties` 파일 생성:

```properties
# 테스트 환경 설정
spring.application.name=spring-react-product-mng-test

# 테스트용 인메모리 H2 데이터베이스 사용
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate 설정 - 테스트용으로 자동 스키마 생성
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
spring.jpa.properties.hibernate.format_sql=false

# H2 콘솔 비활성화 (필요시 true로 변경 가능)
spring.h2.console.enabled=false

# Logging 설정
logging.level.root=WARN
logging.level.com.example.spm=DEBUG
logging.level.org.springframework.web=WARN
logging.level.org.hibernate.SQL=false
```

#### 3. 테스트 클래스 확인

테스트 클래스가 정상적으로 설정되어 있는지 확인:

```java
package com.example.spm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Spring Boot 애플리케이션 컨텍스트 로드 테스트
 * 테스트용 H2 인메모리 데이터베이스 사용
 */
@SpringBootTest
class SpringReactProductMngApplicationTests {

    @Test
    void contextLoads() {
        // 컨텍스트가 정상적으로 로드되는지 확인
    }

}
```

**참고:**

- `src/test/resources/application.properties`는 테스트 실행 시 자동으로 사용됨
- H2 인메모리 데이터베이스는 테스트 실행 시 자동으로 생성되고 종료 시 삭제됨
- 실제 운영 환경(MySQL)과 테스트 환경(H2)을 분리하여 독립적인 테스트 가능
- `spring.jpa.hibernate.ddl-auto=create-drop`은 테스트 시작 시 스키마를 생성하고 종료 시 삭제함

**확인:**

```bash
.\gradlew clean test
```

테스트가 성공적으로 통과하면 해결 완료입니다.

---
