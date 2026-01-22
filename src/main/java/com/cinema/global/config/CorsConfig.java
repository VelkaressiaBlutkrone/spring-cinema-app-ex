package com.cinema.global.config;

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
