package com.cinema.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * API 통합 테스트
 * - Redis: Testcontainers
 * - DB: H2 인메모리 (test profile)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
@Tag("integration")
@DisplayName("API 통합 테스트")
class ScreeningApiIntegrationTest {

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379).toString());
        registry.add("redisson.single-server-config.address",
                () -> "redis://" + redis.getHost() + ":" + redis.getMappedPort(6379));
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/public-key - 인증 불필요")
    void getPublicKey() throws Exception {
        // given: 공개키 API 요청 (인증 없음)
        // when: GET /api/public-key 호출
        // then: 200 OK
        mockMvc.perform(get("/api/public-key"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/movies - 인증 불필요")
    void getMovies() throws Exception {
        // given: 영화 목록 API 요청 (page=0, size=10, 인증 없음)
        // when: GET /api/movies?page=0&size=10 호출
        // then: 200 OK
        mockMvc.perform(get("/api/movies")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }
}
