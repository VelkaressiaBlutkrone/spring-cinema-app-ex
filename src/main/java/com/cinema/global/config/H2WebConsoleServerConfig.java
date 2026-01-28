package com.cinema.global.config;

import java.sql.SQLException;

import org.h2.tools.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import lombok.extern.slf4j.Slf4j;

/**
 * H2 Web Console 서버 (DEV 전용)
 *
 * <p>
 * Spring Boot 4 환경에서 /h2-console 서블릿 자동 설정이 동작하지 않는 경우가 있어,
 * H2가 제공하는 Web Console 서버를 별도 포트로 띄워 개발 편의성을 확보한다.
 * </p>
 *
 * <ul>
 * <li>접속: http://localhost:8082</li>
 * <li>JDBC URL: jdbc:h2:mem:cinema</li>
 * </ul>
 */
@Slf4j
@Configuration
@Profile("dev")
public class H2WebConsoleServerConfig {

    @Bean(initMethod = "start", destroyMethod = "stop")
    public Server h2WebConsoleServer() throws SQLException {
        // -webAllowOthers 는 보안상 기본 false (로컬 접속만)
        Server server = Server.createWebServer(
                "-web",
                "-webPort", "8082",
                "-webDaemon",
                "-ifExists");

        log.info("[H2 Console] Web Console starting on http://localhost:8082");
        return server;
    }
}
