# Spring Boot/백엔드 관련 문제

## 문제: spring-boot-starter-aop를 찾을 수 없음

**에러 메시지:**

```
Could not find org.springframework.boot:spring-boot-starter-aop:.
```

**원인:**

- Spring Boot 4.0에서는 `spring-boot-starter-aop`가 `spring-boot-starter-aspectj`로 변경됨
- 의존성 이름이 변경되어 기존 이름으로는 찾을 수 없음

**해결 방법:**

### build.gradle 수정

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

## 문제: JSON 직렬화 라이브러리 변경 (Jackson → Gson)

**변경 사항:**

- Jackson 대신 Gson을 사용하여 JSON 직렬화 처리
- `LoggingAspect`에서 `ObjectMapper` 대신 `Gson` 사용

**해결 방법:**

### build.gradle에 Gson 의존성 추가

`build.gradle` 파일에서 Jackson 의존성을 제거하고 Gson 추가:

```gradle
// 변경 전
implementation 'org.springframework.boot:spring-boot-starter-json'
implementation 'com.fasterxml.jackson.core:jackson-databind'

// 변경 후
implementation 'com.google.code.gson:gson'
```

### LoggingAspect 수정

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

### Gson Bean 설정

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

## 문제: WebRequest.getParameterNames() 타입 불일치

**에러 메시지:**

```
error: incompatible types: Iterator<String> cannot be converted to String[]
```

**원인:**

- Spring Boot 4.0 / Jakarta EE에서 `WebRequest.getParameterNames()`의 반환 타입이 `Iterator<String>`으로 변경됨
- 기존 코드에서 `String[]`로 받으려고 해서 타입 불일치 발생

**해결 방법:**

### GlobalExceptionHandler 수정

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

## 문제: 테스트 실패 - NoSuchBeanDefinitionException

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

### 1. build.gradle에 H2 테스트 의존성 추가

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

### 2. 테스트용 application.properties 생성

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

### 3. 테스트 클래스 확인

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
