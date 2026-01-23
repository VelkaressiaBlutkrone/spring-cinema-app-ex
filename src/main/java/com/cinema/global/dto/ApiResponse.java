package com.cinema.global.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 통합 API 응답 DTO
 *
 * @param <T> 응답 데이터 타입
 */
@Getter
@Builder
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final LocalDateTime timestamp;

    /**
     * 성공 응답 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 성공 응답 (메시지 + 데이터)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 성공 응답 (데이터 없음)
     */
    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 성공 응답 (메시지만)
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 실패 응답
     */
    public static <T> ApiResponse<T> fail(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
