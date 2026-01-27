# 백엔드 재사용 모듈 가이드

본 문서는 백엔드 프로젝트에서 재사용 가능한 모듈들을 정리한 문서입니다.

## 목차

1. [전역 설정 (Global Config)](#전역-설정-global-config)
2. [AOP 로깅](#aop-로깅)
3. [예외 처리 체계](#예외-처리-체계)
4. [기본 엔티티](#기본-엔티티)
5. [DTO 패턴](#dto-패턴)
6. [QueryDSL 사용 가이드](#querydsl-사용-가이드)

---

## 전역 설정 (Global Config)

### 위치: `global/config/`

### 1. CorsConfig

CORS(Cross-Origin Resource Sharing) 설정

```java
package com.example.spm.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS 설정 - React/Vite 클라이언트 허용
 */
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

        // 운영 환경에서는 특정 origin만 허용
        // config.addAllowedOrigin("https://yourdomain.com");

        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

**사용 방법:** Bean으로 자동 등록되어 `/api/**` 경로에 적용

---

### 2. SecurityConfig

Spring Security 설정

```java
package com.example.spm.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API)
            .csrf(csrf -> csrf.disable())

            // Stateless 세션 정책
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 권한 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").authenticated()
                .anyRequest().permitAll())

            // 보안 헤더 설정
            .headers(headers -> headers
                .xssProtection(xss -> xss.disable())
                .contentSecurityPolicy(csp ->
                    csp.policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }
}
```

**주요 설정:**

- CSRF 비활성화 (REST API용)
- Stateless 세션 (토큰 기반 인증용)
- `/actuator/**`만 인증 필요, 나머지 허용
- XSS, CSP, Frame Options 헤더 설정

---

### 3. QueryDslConfig

QueryDSL JPAQueryFactory 설정

```java
package com.example.spm.global.config;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * QueryDSL 설정 - JPAQueryFactory Bean 등록
 */
@Configuration
public class QueryDslConfig {

    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}
```

**사용 방법:**

```java
@Repository
@RequiredArgsConstructor
public class ProductRepositoryImpl implements ProductRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Product> searchProducts(ProductSearchCondition condition) {
        return queryFactory
            .selectFrom(product)
            .where(
                productNameContains(condition.getProductName()),
                productCodeEq(condition.getProductCode())
            )
            .fetch();
    }
}
```

---

### 4. GsonConfig

Gson JSON 라이브러리 설정

```java
package com.example.spm.global.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gson 설정 - JSON 직렬화/역직렬화
 */
@Configuration
public class GsonConfig {

    @Bean
    public Gson gson() {
        return new GsonBuilder()
            .setPrettyPrinting()      // 보기 좋은 출력
            .serializeNulls()         // null 값도 직렬화
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")  // 날짜 포맷
            .create();
    }
}
```

**사용 방법:**

```java
@Service
@RequiredArgsConstructor
public class MyService {

    private final Gson gson;

    public String toJson(Object obj) {
        return gson.toJson(obj);
    }

    public <T> T fromJson(String json, Class<T> clazz) {
        return gson.fromJson(json, clazz);
    }
}
```

---

## AOP 로깅

### 위치: `global/annotation/`, `global/aspect/`

### 1. @Logging 어노테이션

메서드 로깅을 위한 커스텀 어노테이션

```java
package com.example.spm.global.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 메서드 로깅 어노테이션
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Logging {

    LogLevel level() default LogLevel.INFO;
    boolean logParams() default true;       // 파라미터 로깅 여부
    boolean logResult() default true;       // 결과 로깅 여부
    boolean logExecutionTime() default true; // 실행 시간 로깅 여부

    enum LogLevel {
        DEBUG, INFO, WARN, ERROR
    }
}
```

**사용 방법:**

```java
@Service
public class ProductService {

    @Logging(level = Logging.LogLevel.INFO, logParams = true, logResult = true)
    public ProductResponse createProduct(ProductRequest request) {
        // 메서드 시작, 파라미터, 결과, 실행 시간이 자동 로깅됨
        return ...;
    }

    @Logging(logResult = false)  // 결과는 로깅하지 않음
    public void deleteProduct(Long id) {
        ...
    }
}
```

---

### 2. LoggingAspect

`@Logging` 어노테이션 처리 AOP

```java
package com.example.spm.global.aspect;

import com.example.spm.global.annotation.Logging;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * @Logging 어노테이션 처리 Aspect
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final Gson gson;
    private static final int MAX_LOG_LENGTH = 500;

    @Around("@annotation(logging)")
    public Object logMethod(ProceedingJoinPoint joinPoint, Logging logging) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();

        // 메서드 시작 로깅
        if (logging.logParams()) {
            String params = truncate(gson.toJson(joinPoint.getArgs()));
            log.info("[START] {} - params: {}", methodName, params);
        } else {
            log.info("[START] {}", methodName);
        }

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            // 메서드 종료 로깅
            if (logging.logResult()) {
                String resultStr = truncate(gson.toJson(result));
                log.info("[END] {} - result: {}, time: {}ms", methodName, resultStr, executionTime);
            } else if (logging.logExecutionTime()) {
                log.info("[END] {} - time: {}ms", methodName, executionTime);
            }

            return result;
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("[ERROR] {} - exception: {}, time: {}ms", methodName, e.getMessage(), executionTime);
            throw e;
        }
    }

    private String truncate(String str) {
        return str.length() > MAX_LOG_LENGTH
            ? str.substring(0, MAX_LOG_LENGTH) + "..."
            : str;
    }
}
```

**로그 출력 예시:**

```
[START] ProductService.createProduct(..) - params: [{"productCode":"P001","productName":"테스트"}]
[END] ProductService.createProduct(..) - result: {"productId":1,...}, time: 45ms
[ERROR] ProductService.createProduct(..) - exception: Product code already exists, time: 12ms
```

---

### 3. ControllerLoggingAspect

Controller 자동 로깅 AOP

```java
package com.example.spm.global.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Controller 요청/응답 자동 로깅
 */
@Aspect
@Component
@Slf4j
public class ControllerLoggingAspect {

    @Around("execution(* com.example.spm.domain.controller..*(..))")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getCurrentRequest();
        String clientIp = getClientIp(request);
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();

        long startTime = System.currentTimeMillis();

        log.info("[REQUEST] {} {} {} - IP: {}", method, uri,
            query != null ? "?" + query : "", clientIp);

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("[RESPONSE] {} {} - time: {}ms", method, uri, executionTime);
            return result;
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("[ERROR] {} {} - error: {}, time: {}ms", method, uri, e.getMessage(), executionTime);
            throw e;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null) ip = request.getHeader("X-Real-IP");
        if (ip == null) ip = request.getRemoteAddr();
        return ip;
    }

    private HttpServletRequest getCurrentRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    }
}
```

**사용 방법:** `domain.controller` 패키지의 모든 public 메서드에 자동 적용

**로그 출력 예시:**

```
[REQUEST] GET /api/products ?page=0&size=10 - IP: 127.0.0.1
[RESPONSE] GET /api/products - time: 123ms
```

---

## 예외 처리 체계

### 위치: `exception/`

### 1. ErrorCode (에러 코드 정의)

```java
package com.example.spm.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 에러 코드 정의
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 상품 관련 에러
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "PRODUCT_001", "상품을 찾을 수 없습니다."),
    PRODUCT_CODE_DUPLICATE(HttpStatus.CONFLICT, "PRODUCT_002", "이미 존재하는 상품 코드입니다."),

    // 카테고리 관련 에러
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CATEGORY_001", "카테고리를 찾을 수 없습니다."),

    // 재고 관련 에러
    INSUFFICIENT_STOCK(HttpStatus.BAD_REQUEST, "STOCK_001", "재고가 부족합니다."),

    // 서버 에러
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_001", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
```

**새 에러 코드 추가 방법:**

```java
// 에러 코드 추가
USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_001", "사용자를 찾을 수 없습니다."),
INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "AUTH_001", "비밀번호가 일치하지 않습니다."),
```

---

### 2. BusinessException (비즈니스 예외)

```java
package com.example.spm.exception;

import lombok.Getter;

/**
 * 비즈니스 로직 예외
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String additionalMessage) {
        super(errorCode.getMessage() + " " + additionalMessage);
        this.errorCode = errorCode;
    }
}
```

**사용 방법:**

```java
@Service
public class ProductService {

    public Product getProduct(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    public Product createProduct(ProductRequest request) {
        if (productRepository.existsByProductCode(request.getProductCode())) {
            throw new BusinessException(
                ErrorCode.PRODUCT_CODE_DUPLICATE,
                "코드: " + request.getProductCode()
            );
        }
        // ...
    }
}
```

---

### 3. ErrorResponse (에러 응답 DTO)

```java
package com.example.spm.exception;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

/**
 * 에러 응답 DTO
 */
@Getter
@Builder
public class ErrorResponse {

    private final LocalDateTime timestamp;
    private final int status;
    private final String code;
    private final String error;
    private final String message;

    public static ResponseEntity<ErrorResponse> toResponseEntity(ErrorCode errorCode) {
        return ResponseEntity
            .status(errorCode.getHttpStatus())
            .body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(errorCode.getHttpStatus().value())
                .code(errorCode.getCode())
                .error(errorCode.getHttpStatus().name())
                .message(errorCode.getMessage())
                .build());
    }

    public static ResponseEntity<ErrorResponse> toResponseEntity(HttpStatus status, String message) {
        return ResponseEntity
            .status(status)
            .body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .code(status.name())
                .error(status.getReasonPhrase())
                .message(message)
                .build());
    }
}
```

**응답 예시:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "code": "PRODUCT_001",
  "error": "NOT_FOUND",
  "message": "상품을 찾을 수 없습니다."
}
```

---

### 4. GlobalExceptionHandler (전역 예외 핸들러)

```java
package com.example.spm.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 처리
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("[BusinessException] code: {}, message: {}",
            e.getErrorCode().getCode(), e.getMessage());
        return ErrorResponse.toResponseEntity(e.getErrorCode());
    }

    /**
     * Validation 예외 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        log.warn("[ValidationException] {}", message);
        return ErrorResponse.toResponseEntity(HttpStatus.BAD_REQUEST, message);
    }

    /**
     * 일반 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("[Exception] {}", e.getMessage(), e);
        return ErrorResponse.toResponseEntity(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "서버 오류가 발생했습니다."
        );
    }
}
```

---

## 기본 엔티티

### 위치: `domain/entity/`

### BaseTimeEntity

생성일시/수정일시 자동 관리 추상 엔티티

```java
package com.example.spm.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 생성일시/수정일시 자동 관리 기본 엔티티
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
}
```

**사용 방법:**

```java
@Entity
@Table(name = "products")
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    private String productName;

    // createdDate, lastModifiedDate는 자동 관리됨
}
```

**필수 설정:** Application 클래스에 `@EnableJpaAuditing` 추가

```java
@SpringBootApplication
@EnableJpaAuditing  // JPA Auditing 활성화
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## DTO 패턴

### 권장 패턴

#### 1. 내부 정적 클래스 패턴

```java
package com.example.spm.domain.dto;

import lombok.*;

/**
 * 상품 DTO
 */
public class ProdDto {

    /**
     * 상품 등록/수정 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotBlank(message = "상품 코드는 필수입니다.")
        private String productCode;

        @NotBlank(message = "상품명은 필수입니다.")
        @Size(max = 100, message = "상품명은 100자 이내여야 합니다.")
        private String productName;

        private String description;
        private Long categoryId;
        private ProductStatus status;
    }

    /**
     * 상품 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private Long productId;
        private String productCode;
        private String productName;
        private String description;
        private Long categoryId;
        private String categoryName;
        private ProductStatus status;
        private LocalDateTime createdDate;
        private LocalDateTime lastModifiedDate;

        /**
         * Entity → Response 변환
         */
        public static Response from(Product product) {
            return Response.builder()
                .productId(product.getProductId())
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .status(product.getStatus())
                .createdDate(product.getCreatedDate())
                .lastModifiedDate(product.getLastModifiedDate())
                .build();
        }
    }

    /**
     * 상품 검색 조건 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchCondition {
        private String productName;
        private String productCode;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private ProductStatus status;
    }
}
```

#### 2. 사용 방법

```java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProdController {

    private final ProdService prodService;

    @PostMapping
    public ResponseEntity<ProdDto.Response> create(@Valid @RequestBody ProdDto.Request request) {
        ProdDto.Response response = prodService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ProdDto.Response>> search(
            ProdDto.SearchCondition condition,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(prodService.searchProducts(condition, pageable));
    }
}
```

---

## QueryDSL 사용 가이드

### 위치: `global/config/QueryDslConfig.java`, `domain/*/repository/`

### 개요

프로젝트에서는 **복잡한 쿼리와 다수 조인이 필요한 경우 QueryDSL을 우선 사용**합니다. (자세한 규칙은 [RULE.md](./RULE.md#23-repository-규칙) 참조)

### 1. QueryDSL 설정

`QueryDslConfig`에서 `JPAQueryFactory`를 Bean으로 등록합니다:

```java
@Configuration
public class QueryDslConfig {
    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}
```

### 2. Custom Repository 패턴

QueryDSL을 사용하는 Repository는 Custom Repository 패턴을 적용합니다:

#### 2.1 기본 Repository 인터페이스

```java
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    // 단순 조회만 포함 (Spring Data JPA 메서드)
    Optional<Reservation> findByReservationNo(String reservationNo);
}
```

#### 2.2 Custom Repository 인터페이스

```java
public interface ReservationRepositoryCustom {
    /**
     * 예매 상세 조회 (다수 조인 포함)
     */
    Optional<Reservation> findByIdWithDetails(Long id);
    
    /**
     * 회원의 예매 목록 조회 (동적 조건)
     */
    List<Reservation> findByMemberIdWithDetails(Long memberId, ReservationStatus status);
}
```

#### 2.3 Custom Repository 구현체

```java
@Repository
@RequiredArgsConstructor
public class ReservationRepositoryImpl implements ReservationRepositoryCustom {
    
    private final JPAQueryFactory queryFactory;
    
    // Q클래스 import
    private static final QReservation reservation = QReservation.reservation;
    private static final QMember member = QMember.member;
    private static final QScreening screening = QScreening.screening;
    private static final QMovie movie = QMovie.movie;
    private static final QReservationSeat reservationSeat = QReservationSeat.reservationSeat;
    private static final QSeat seat = QSeat.seat;
    
    @Override
    public Optional<Reservation> findByIdWithDetails(Long id) {
        return Optional.ofNullable(
            queryFactory
                .selectFrom(reservation)
                .join(reservation.member, member).fetchJoin()
                .join(reservation.screening, screening).fetchJoin()
                .join(screening.movie, movie).fetchJoin()
                .leftJoin(reservation.reservationSeats, reservationSeat).fetchJoin()
                .leftJoin(reservationSeat.seat, seat).fetchJoin()
                .where(reservation.id.eq(id))
                .fetchOne()
        );
    }
    
    @Override
    public List<Reservation> findByMemberIdWithDetails(Long memberId, ReservationStatus status) {
        return queryFactory
            .selectFrom(reservation)
            .join(reservation.screening, screening).fetchJoin()
            .join(screening.movie, movie).fetchJoin()
            .where(
                reservation.member.id.eq(memberId),
                status != null ? reservation.status.eq(status) : null
            )
            .orderBy(reservation.createdAt.desc())
            .fetch();
    }
}
```

#### 2.4 기본 Repository에 Custom 인터페이스 상속

```java
public interface ReservationRepository extends JpaRepository<Reservation, Long>, 
                                               ReservationRepositoryCustom {
    // 기본 JPA 메서드와 Custom 메서드 모두 사용 가능
}
```

### 3. QueryDSL 사용 예시

#### 3.1 다수 조인 쿼리

```java
// Screening + Movie + Screen + Theater 조인
public Optional<Screening> findByIdWithDetails(Long id) {
    return Optional.ofNullable(
        queryFactory
            .selectFrom(screening)
            .join(screening.movie, movie).fetchJoin()
            .join(screening.screen, screen).fetchJoin()
            .join(screen.theater, theater).fetchJoin()
            .where(screening.id.eq(id))
            .fetchOne()
    );
}
```

#### 3.2 동적 쿼리

```java
public List<Screening> searchScreenings(ScreeningSearchCondition condition) {
    return queryFactory
        .selectFrom(screening)
        .join(screening.movie, movie).fetchJoin()
        .where(
            condition.getMovieId() != null ? screening.movie.id.eq(condition.getMovieId()) : null,
            condition.getStartDate() != null ? screening.startTime.goe(condition.getStartDate()) : null,
            condition.getEndDate() != null ? screening.endTime.loe(condition.getEndDate()) : null,
            condition.getStatus() != null ? screening.status.eq(condition.getStatus()) : null
        )
        .orderBy(screening.startTime.asc())
        .fetch();
}
```

#### 3.3 집계 쿼리

```java
public List<Object[]> countByScreeningIdGroupByStatus(Long screeningId) {
    return queryFactory
        .select(
            screeningSeat.status,
            screeningSeat.status.count()
        )
        .from(screeningSeat)
        .where(screeningSeat.screening.id.eq(screeningId))
        .groupBy(screeningSeat.status)
        .fetch();
}
```

#### 3.4 페이징 쿼리

```java
public Page<Reservation> findByMemberIdWithPaging(Long memberId, Pageable pageable) {
    List<Reservation> content = queryFactory
        .selectFrom(reservation)
        .join(reservation.screening, screening).fetchJoin()
        .join(screening.movie, movie).fetchJoin()
        .where(reservation.member.id.eq(memberId))
        .orderBy(reservation.createdAt.desc())
        .offset(pageable.getOffset())
        .limit(pageable.getPageSize())
        .fetch();
    
    Long total = queryFactory
        .select(reservation.count())
        .from(reservation)
        .where(reservation.member.id.eq(memberId))
        .fetchOne();
    
    return new PageImpl<>(content, pageable, total != null ? total : 0L);
}
```

### 4. QueryDSL 사용 규칙

#### 4.1 필수 사용 케이스

다음 경우는 **반드시 QueryDSL을 사용**해야 합니다:

1. **다수 조인이 필요한 SELECT 문** (2개 이상 테이블 조인)
2. **동적 쿼리** (조건에 따라 WHERE 절이 변경되는 경우)
3. **복잡한 집계 함수 및 서브쿼리**
4. **성능 최적화가 필요한 쿼리** (N+1 문제 해결)

#### 4.2 Spring Data JPA 허용 케이스

다음 경우는 Spring Data JPA 메서드 네이밍 규칙 사용 가능:

1. **단순 조회** (단일 테이블, 단일 조건)
   - `findById(Long id)`
   - `findByLoginId(String loginId)`
2. **기본 CRUD 작업**
   - `save()`, `delete()`, `existsById()` 등

### 5. 주의사항

1. **Q클래스는 static final로 선언**
   - 매번 생성하지 않고 재사용
   ```java
   private static final QReservation reservation = QReservation.reservation;
   ```

2. **N+1 문제 방지**
   - 필요한 경우 `fetchJoin()` 사용
   - `join()`과 `fetchJoin()`의 차이 이해

3. **동적 쿼리에서 null 처리**
   - `BooleanExpression`을 사용하여 null 조건 제외
   ```java
   .where(
       condition.getStatus() != null ? reservation.status.eq(condition.getStatus()) : null
   )
   ```

4. **트랜잭션 관리**
   - QueryDSL 쿼리는 Service 레이어에서 트랜잭션 관리
   - Repository는 트랜잭션 경계를 설정하지 않음

### 6. 현재 Repository 전환 현황

| Repository | 현재 상태 | QueryDSL 전환 필요 여부 | 우선순위 |
|------------|----------|----------------------|---------|
| `ReservationRepository` | `@Query` JPQL 사용 (다수 조인) | **필수** | 높음 |
| `ScreeningRepository` | `@Query` JPQL 사용 (다수 조인) | **필수** | 높음 |
| `ScreeningSeatRepository` | `@Query` JPQL 사용 (집계 쿼리) | **권장** | 중간 |
| `ScreenRepository` | `@Query` JPQL 사용 (조인) | **권장** | 중간 |
| `PaymentRepository` | Spring Data JPA 메서드 | 선택적 | 낮음 |
| `MemberRepository` | Spring Data JPA 메서드 | 선택적 | 낮음 |
| `MovieRepository` | Spring Data JPA 메서드 | 선택적 | 낮음 |
| `SeatRepository` | Spring Data JPA 메서드 | 선택적 | 낮음 |
| `TheaterRepository` | Spring Data JPA 메서드 | 선택적 | 낮음 |

**전환 우선순위:**
1. **높음**: 다수 조인이 포함된 `ReservationRepository`, `ScreeningRepository`
2. **중간**: 집계 쿼리나 조인이 있는 `ScreeningSeatRepository`, `ScreenRepository`
3. **낮음**: 단순 조회만 있는 Repository는 필요 시 전환

---

## 재사용 가이드라인

### 새 프로젝트에서 사용 시

1. **전역 설정 복사**
   - `global/config/` 폴더 복사
   - 패키지명 변경 후 사용

2. **예외 처리 체계 복사**
   - `exception/` 폴더 복사
   - `ErrorCode`에 새 에러 코드 추가

3. **AOP 로깅 복사**
   - `global/annotation/`, `global/aspect/` 복사
   - Controller 경로 수정 필요 시 `ControllerLoggingAspect` 수정

4. **BaseTimeEntity 복사**
   - `domain/entity/BaseTimeEntity.java` 복사
   - `@EnableJpaAuditing` 설정 추가

### 의존성 요구사항

```gradle
dependencies {
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-aspectj'

    // JSON
    implementation 'com.google.code.gson:gson'

    // QueryDSL
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

---

## 파일 목록

```
src/main/java/com/example/spm/
├── global/
│   ├── annotation/
│   │   └── Logging.java              # 로깅 어노테이션
│   ├── aspect/
│   │   ├── LoggingAspect.java        # @Logging 처리 AOP
│   │   └── ControllerLoggingAspect.java  # Controller 자동 로깅
│   └── config/
│       ├── CorsConfig.java           # CORS 설정
│       ├── GsonConfig.java           # Gson 설정
│       ├── QueryDslConfig.java       # QueryDSL 설정
│       └── SecurityConfig.java       # Security 설정
├── exception/
│   ├── BusinessException.java        # 비즈니스 예외
│   ├── ErrorCode.java                # 에러 코드 정의
│   ├── ErrorResponse.java            # 에러 응답 DTO
│   └── GlobalExceptionHandler.java   # 전역 예외 핸들러
└── domain/
    ├── entity/
    │   └── BaseTimeEntity.java       # 생성/수정일시 기본 엔티티
    └── dto/
        └── ProdDto.java              # DTO 패턴 예시
```
