package com.cinema.global.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

/**
 * 전역 예외 처리 핸들러
 * 
 * RULE: 개인정보, 결제 상세 정보, JWT 전체 값은 로그에 기록하지 않음
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("[BusinessException] code={}, message={}", 
                e.getErrorCode().getCode(), e.getMessage());
        return ErrorResponse.of(e.getErrorCode(), extractAdditionalMessage(e));
    }

    /**
     * 좌석 예외 처리 (핵심 도메인)
     */
    @ExceptionHandler(SeatException.class)
    public ResponseEntity<ErrorResponse> handleSeatException(SeatException e) {
        log.warn("[SeatException] code={}, screeningId={}, seatId={}, message={}",
                e.getErrorCode().getCode(), e.getScreeningId(), e.getSeatId(), e.getMessage());
        return ErrorResponse.of(e.getErrorCode(), e.getMessage());
    }

    /**
     * Validation 예외 처리 (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn("[ValidationException] {}", message);
        return ErrorResponse.of(ErrorCode.INVALID_INPUT, message);
    }

    /**
     * Validation 예외 처리 (@Validated)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
        log.warn("[ConstraintViolationException] {}", message);
        return ErrorResponse.of(ErrorCode.INVALID_INPUT, message);
    }

    /**
     * 필수 파라미터 누락 예외 처리
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException e) {
        String message = String.format("필수 파라미터 '%s'이(가) 누락되었습니다.", e.getParameterName());
        log.warn("[MissingParameterException] {}", message);
        return ErrorResponse.of(ErrorCode.MISSING_REQUIRED_FIELD, message);
    }

    /**
     * 파라미터 타입 불일치 예외 처리
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException e) {
        String message = String.format("파라미터 '%s'의 타입이 올바르지 않습니다.", e.getName());
        log.warn("[TypeMismatchException] {}", message);
        return ErrorResponse.of(ErrorCode.INVALID_INPUT, message);
    }

    /**
     * 리소스 없음 예외 처리
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(NoResourceFoundException e) {
        log.warn("[NoResourceFoundException] path={}", e.getResourcePath());
        return ErrorResponse.of(HttpStatus.NOT_FOUND, "NOT_FOUND", 
                "요청한 리소스를 찾을 수 없습니다: " + e.getResourcePath());
    }

    /**
     * 인증 예외 처리
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e) {
        log.warn("[AuthenticationException] {}", e.getMessage());
        return ErrorResponse.of(ErrorCode.UNAUTHORIZED);
    }

    /**
     * 권한 예외 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("[AccessDeniedException] {}", e.getMessage());
        return ErrorResponse.of(ErrorCode.ACCESS_DENIED);
    }

    /**
     * 일반 예외 처리 (최후의 방어선)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("[UnhandledException] {}", e.getMessage(), e);
        return ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    /**
     * BusinessException에서 추가 메시지 추출
     */
    private String extractAdditionalMessage(BusinessException e) {
        String fullMessage = e.getMessage();
        String baseMessage = e.getErrorCode().getMessage();
        
        if (fullMessage != null && fullMessage.startsWith(baseMessage) && fullMessage.length() > baseMessage.length()) {
            return fullMessage.substring(baseMessage.length()).trim();
        }
        return "";
    }
}
