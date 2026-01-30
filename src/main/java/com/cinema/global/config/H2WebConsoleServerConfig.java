package com.cinema.global.config;

import java.sql.SQLException;

import org.h2.tools.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;

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
 * <li>bootRun 종료 시 8082 포트도 함께 해제되도록 shutdown 시 먼저 중지</li>
 * </ul>
 */
@Slf4j
@Configuration
@Profile("dev")
public class H2WebConsoleServerConfig {

    private static final String H2_WEB_PORT = "8082";

    private Server h2WebServer;

    @Bean(destroyMethod = "")
    public Server h2WebConsoleServer() throws SQLException {
        // -webAllowOthers 는 보안상 기본 false (로컬 접속만)
        Server server = Server.createWebServer(
                "-web",
                "-webPort", H2_WEB_PORT,
                "-webDaemon",
                "-ifExists");

        server.start();
        this.h2WebServer = server;
        log.info("[H2 Console] Web Console starting on http://localhost:{}", H2_WEB_PORT);

        // bootRun 종료(Ctrl+C 등) 시 JVM shutdown hook으로 8082 포트 확실히 해제
        Runtime.getRuntime().addShutdownHook(new Thread(() -> stopServer(server), "h2-console-shutdown"));

        return server;
    }

    /**
     * Spring Context 종료 시 H2 Web Server 먼저 중지 (8080 톰캣과 함께 8082 해제).
     */
    @Order(Integer.MIN_VALUE)
    @EventListener(ContextClosedEvent.class)
    public void onContextClosed(@SuppressWarnings("unused") ContextClosedEvent event) {
        stopServer(h2WebServer);
    }

    private void stopServer(Server server) {
        if (server != null && server.isRunning(false)) {
            log.info("[H2 Console] Stopping Web Console (port {})", H2_WEB_PORT);
            server.stop();
        }
    }
}
