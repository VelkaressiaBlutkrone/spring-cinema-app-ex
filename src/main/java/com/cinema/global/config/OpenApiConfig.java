package com.cinema.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3 (Swagger) 설정 (Step 21)
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private int serverPort;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("영화관 예매 시스템 API")
                        .description("멀티플렉스 영화관 실시간 좌석 예매 REST API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Cinema Team")))
                .addServersItem(new Server()
                        .url("/")
                        .description("로컬 서버"));
    }
}
