package com.cinema.global.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS 설정
 * 
 * - 개발 환경: 모든 origin 허용
 * - 운영 환경: 특정 origin만 허용 (application.yml에서 설정)
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:*}")
    private String allowedOrigins;

    @Value("${cors.max-age:3600}")
    private Long maxAge;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);

        // Origin 설정
        if ("*".equals(allowedOrigins)) {
            // 개발 환경: 모든 origin 허용
            config.addAllowedOriginPattern("*");
        } else {
            // 운영 환경: 특정 origin만 허용
            List<String> origins = List.of(allowedOrigins.split(","));
            origins.forEach(origin -> config.addAllowedOrigin(origin.trim()));
        }

        // 허용 헤더
        config.addAllowedHeader("*");

        // 허용 메서드
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        // 노출 헤더 (클라이언트에서 접근 가능한 응답 헤더)
        config.addExposedHeader("Authorization");
        config.addExposedHeader("X-Hold-Token");
        config.addExposedHeader("X-Request-Id");

        // Preflight 요청 캐시 시간
        config.setMaxAge(maxAge);

        // 모든 API 경로에 적용
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/admin/**", config);

        return new CorsFilter(source);
    }
}
