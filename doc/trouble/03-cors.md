# CORS 관련 문제

## 문제: 프론트엔드에서 API 호출 시 CORS 오류 발생

**에러 메시지:**

```
Access to XMLHttpRequest at 'http://localhost:8080/api/products' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**원인:**

- 백엔드 CORS 설정이 프론트엔드 도메인을 허용하지 않음
- Security 설정이 CORS를 차단함

**해결 방법:**

### 1. CorsConfig 확인

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

### 2. SecurityConfig 확인

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

### 3. 프론트엔드 API URL 확인

`front_end/src/services/api/productApi.ts`에서 API 베이스 URL 확인:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

환경 변수 설정 (`.env` 파일):

```
VITE_API_BASE_URL=http://localhost:8080
```
