package com.cinema.global.config;

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
                .setPrettyPrinting() // 보기 좋은 출력
                .serializeNulls() // null 값도 직렬화
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss") // 날짜 포맷
                .create();
    }
}
