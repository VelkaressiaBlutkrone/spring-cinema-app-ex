package com.cinema.global.config;

import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.GsonHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

/**
 * Gson 설정 - Jackson 대신 Gson을 JSON 직렬화/역직렬화에 사용
 */
@Configuration
public class GsonConfig implements WebMvcConfigurer {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Bean
    public Gson gson() {
        return new GsonBuilder()
                .setPrettyPrinting()
                .serializeNulls()
                // LocalDateTime 직렬화/역직렬화
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeSerializer())
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeDeserializer())
                // LocalDate 직렬화/역직렬화
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .registerTypeAdapter(LocalDate.class, new LocalDateDeserializer())
                // LocalTime 직렬화/역직렬화
                .registerTypeAdapter(LocalTime.class, new LocalTimeSerializer())
                .registerTypeAdapter(LocalTime.class, new LocalTimeDeserializer())
                .create();
    }

    /**
     * Spring MVC에서 Gson을 기본 JSON 변환기로 설정
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        GsonHttpMessageConverter gsonConverter = new GsonHttpMessageConverter();
        gsonConverter.setGson(gson());
        gsonConverter.setSupportedMediaTypes(List.of(
                MediaType.APPLICATION_JSON,
                new MediaType("application", "*+json")
        ));
        // 최우선 순위로 추가
        converters.add(0, gsonConverter);
    }

    // ========================================
    // LocalDateTime 직렬화/역직렬화
    // ========================================
    private static class LocalDateTimeSerializer implements JsonSerializer<LocalDateTime> {
        @Override
        public JsonElement serialize(LocalDateTime src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.format(DATE_TIME_FORMATTER));
        }
    }

    private static class LocalDateTimeDeserializer implements JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            return LocalDateTime.parse(json.getAsString(), DATE_TIME_FORMATTER);
        }
    }

    // ========================================
    // LocalDate 직렬화/역직렬화
    // ========================================
    private static class LocalDateSerializer implements JsonSerializer<LocalDate> {
        @Override
        public JsonElement serialize(LocalDate src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.format(DATE_FORMATTER));
        }
    }

    private static class LocalDateDeserializer implements JsonDeserializer<LocalDate> {
        @Override
        public LocalDate deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            return LocalDate.parse(json.getAsString(), DATE_FORMATTER);
        }
    }

    // ========================================
    // LocalTime 직렬화/역직렬화
    // ========================================
    private static class LocalTimeSerializer implements JsonSerializer<LocalTime> {
        @Override
        public JsonElement serialize(LocalTime src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.format(TIME_FORMATTER));
        }
    }

    private static class LocalTimeDeserializer implements JsonDeserializer<LocalTime> {
        @Override
        public LocalTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            return LocalTime.parse(json.getAsString(), TIME_FORMATTER);
        }
    }
}
