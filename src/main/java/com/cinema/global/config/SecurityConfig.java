package com.cinema.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;

import com.cinema.global.jwt.JwtAuthenticationFilter;
import com.cinema.global.security.ApiRateLimitFilter;
import com.cinema.global.security.AuthRateLimitFilter;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security 설정
 *
 * RULE:
 * - /admin/** 경로는 ADMIN Role 기반 접근 필수
 * - JWT + Refresh Token 인증
 * - Stateless 세션 관리
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize, @PostAuthorize 활성화
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsFilter corsFilter;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthRateLimitFilter authRateLimitFilter;
    private final ApiRateLimitFilter apiRateLimitFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Rate limit (인증 API DoS 방어)
                .addFilterBefore(authRateLimitFilter, CorsFilter.class)
                // API Rate limit (예매/관리자 API, Step 17)
                .addFilterBefore(apiRateLimitFilter, CorsFilter.class)
                // CORS 필터 추가
                .addFilter(corsFilter)

                // CSRF 비활성화 (REST API, Stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // H2 Console은 iframe 사용 - 동일 출처에서만 허용
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin()))

                // 세션 미사용 (JWT 기반 인증)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 요청별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // ========================================
                        // Public 엔드포인트 (인증 불필요)
                        // ========================================
                        // 인증 관련
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/public-key").permitAll()
                        .requestMatchers("/api/members/signup", "/api/members/login").permitAll()
                        .requestMatchers("/api/members/refresh").permitAll()

                        // 영화 조회 (GET)
                        .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/screenings/**").permitAll()
                        // 메인 화면 홈 API (Step 10)
                        .requestMatchers(HttpMethod.GET, "/api/home/**").permitAll()

                        // 클라이언트 로그 수신 (프론트/모바일 → 파일 저장)
                        .requestMatchers(HttpMethod.POST, "/api/logs").permitAll()

                        // 부하 테스트 전용 로그인 (loadtest 프로파일 시에만 컨트롤러 노출)
                        .requestMatchers(HttpMethod.POST, "/api/loadtest/**").permitAll()

                        // Health Check
                        .requestMatchers("/health", "/actuator/health").permitAll()

                        // Swagger/API 문서
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // H2 Console (개발 환경 전용)
                        .requestMatchers("/h2-console/**").permitAll()

                        // ========================================
                        // Admin 전용 엔드포인트
                        // ========================================
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ========================================
                        // 인증 필요 엔드포인트
                        // ========================================
                        .anyRequest().authenticated())

                // 예외 처리
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("""
                                    {"status":401,"code":"AUTH_001","error":"UNAUTHORIZED","message":"인증이 필요합니다."}
                                    """);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("""
                                    {"status":403,"code":"AUTH_004","error":"FORBIDDEN","message":"접근 권한이 없습니다."}
                                    """);
                        }));

        // JWT 필터 추가 (UsernamePasswordAuthenticationFilter 전에 실행)
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
