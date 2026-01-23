package com.cinema.global.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import lombok.Builder;
import lombok.Getter;

/**
 * 통합 에러 응답 DTO
 */
@Getter
@Builder
public class ErrorResponse {

    private final LocalDateTime timestamp;
    private final int status;
    private final String code;
    private final String error;
    private final String message;
    private final String path;

    /**
     * ErrorCode 기반 응답 생성
     */
    public static ResponseEntity<ErrorResponse> of(ErrorCode errorCode) {
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(errorCode.getHttpStatus().value())
                        .code(errorCode.getCode())
                        .error(errorCode.getHttpStatus().name())
                        .message(errorCode.getMessage())
                        .build());
    }

    /**
     * ErrorCode + 추가 메시지 기반 응답 생성
     */
    public static ResponseEntity<ErrorResponse> of(ErrorCode errorCode, String additionalMessage) {
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(errorCode.getHttpStatus().value())
                        .code(errorCode.getCode())
                        .error(errorCode.getHttpStatus().name())
                        .message(errorCode.getMessage() + " - " + additionalMessage)
                        .build());
    }

    /**
     * HttpStatus + 메시지 기반 응답 생성
     */
    public static ResponseEntity<ErrorResponse> of(HttpStatus status, String message) {
        return ResponseEntity
                .status(status)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(status.value())
                        .code(status.name())
                        .error(status.getReasonPhrase())
                        .message(message)
                        .build());
    }

    /**
     * HttpStatus + code + 메시지 기반 응답 생성
     */
    public static ResponseEntity<ErrorResponse> of(HttpStatus status, String code, String message) {
        return ResponseEntity
                .status(status)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(status.value())
                        .code(code)
                        .error(status.getReasonPhrase())
                        .message(message)
                        .build());
    }
}
