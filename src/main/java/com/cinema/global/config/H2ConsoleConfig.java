package com.cinema.global.config;

import org.h2.server.web.JakartaWebServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * H2 Console 설정 (개발 환경 전용)
 *
 * Spring Boot 4에서 H2 Console 자동 설정이 변경되어 수동 등록 필요
 */
@Configuration
@Profile("dev")
public class H2ConsoleConfig {

    @Bean
    public ServletRegistrationBean<JakartaWebServlet> h2Console() {
        ServletRegistrationBean<JakartaWebServlet> registrationBean =
                new ServletRegistrationBean<>(new JakartaWebServlet());
        registrationBean.addUrlMappings("/h2-console/*");
        registrationBean.setLoadOnStartup(1);
        return registrationBean;
    }
}
