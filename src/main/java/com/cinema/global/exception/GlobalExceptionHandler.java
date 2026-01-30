package com.cinema.global.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
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
     * 결제 예외 처리
     */
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePaymentException(PaymentException e) {
        log.warn("[PaymentException] code={}, paymentId={}, reservationId={}, message={}",
                e.getErrorCode().getCode(), e.getPaymentId(), e.getReservationId(), e.getMessage());
        return ErrorResponse.of(e.getErrorCode(), e.getMessage());
    }

    /**
     * 예매 예외 처리
     */
    @ExceptionHandler(ReservationException.class)
    public ResponseEntity<ErrorResponse> handleReservationException(ReservationException e) {
        log.warn("[ReservationException] code={}, reservationId={}, reservationNo={}, message={}",
                e.getErrorCode().getCode(), e.getReservationId(), e.getReservationNo(), e.getMessage());
        return ErrorResponse.of(e.getErrorCode(), e.getMessage());
    }

    /**
     * 상영 스케줄 예외 처리
     */
    @ExceptionHandler(ScreeningException.class)
    public ResponseEntity<ErrorResponse> handleScreeningException(ScreeningException e) {
        log.warn("[ScreeningException] code={}, screeningId={}, message={}",
                e.getErrorCode().getCode(), e.getScreeningId(), e.getMessage());
        return ErrorResponse.of(e.getErrorCode(), e.getMessage());
    }

    /**
     * 회원 예외 처리
     */
    @ExceptionHandler(MemberException.class)
    public ResponseEntity<ErrorResponse> handleMemberException(MemberException e) {
        // 민감 정보 로깅 주의: loginId는 로깅하지 않음
        log.warn("[MemberException] code={}, memberId={}, message={}",
                e.getErrorCode().getCode(), e.getMemberId(), e.getMessage());
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
     * 요청 메서드 미지원 예외 처리 (GET/POST 혼동 등)
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException e) {
        String supported = e.getSupportedHttpMethods() == null ? ""
                : e.getSupportedHttpMethods().stream().map(org.springframework.http.HttpMethod::name)
                        .collect(Collectors.joining(", "));

        log.warn("[MethodNotSupported] method={}, supported={}, message={}",
                e.getMethod(), supported, e.getMessage());

        String message = supported.isBlank()
                ? "요청 메서드가 지원되지 않습니다."
                : "요청 메서드가 지원되지 않습니다. 지원 메서드: " + supported;

        return ErrorResponse.of(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", message);
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
     * RULE: 클라이언트에는 일반 메시지만 반환, 스택 트레이스·내부 메시지 노출 금지 (Step 17)
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
