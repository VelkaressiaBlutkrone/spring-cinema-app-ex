package com.cinema.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 영화관 예매 시스템 에러 코드 정의
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ========================================
    // 인증/인가 관련 (AUTH)
    // ========================================
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH_001", "인증이 필요합니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_002", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_003", "만료된 토큰입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "AUTH_004", "접근 권한이 없습니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_005", "유효하지 않은 Refresh Token입니다."),

    // ========================================
    // 회원 관련 (MEMBER)
    // ========================================
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_001", "회원을 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "MEMBER_002", "이미 존재하는 이메일입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "MEMBER_003", "비밀번호가 일치하지 않습니다."),
    MEMBER_DISABLED(HttpStatus.FORBIDDEN, "MEMBER_004", "비활성화된 회원입니다."),

    // ========================================
    // 영화 관련 (MOVIE)
    // ========================================
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "MOVIE_001", "영화를 찾을 수 없습니다."),
    MOVIE_NOT_SHOWING(HttpStatus.BAD_REQUEST, "MOVIE_002", "현재 상영 중인 영화가 아닙니다."),

    // ========================================
    // 상영관 관련 (SCREEN)
    // ========================================
    SCREEN_NOT_FOUND(HttpStatus.NOT_FOUND, "SCREEN_001", "상영관을 찾을 수 없습니다."),

    // ========================================
    // 상영 스케줄 관련 (SCREENING)
    // ========================================
    SCREENING_NOT_FOUND(HttpStatus.NOT_FOUND, "SCREENING_001", "상영 스케줄을 찾을 수 없습니다."),
    SCREENING_ENDED(HttpStatus.BAD_REQUEST, "SCREENING_002", "이미 종료된 상영입니다."),
    SCREENING_CANCELLED(HttpStatus.BAD_REQUEST, "SCREENING_003", "취소된 상영입니다."),

    // ========================================
    // 좌석 관련 (SEAT) - 핵심 도메인
    // ========================================
    SEAT_NOT_FOUND(HttpStatus.NOT_FOUND, "SEAT_001", "좌석을 찾을 수 없습니다."),
    SEAT_NOT_AVAILABLE(HttpStatus.CONFLICT, "SEAT_002", "예매 가능한 좌석이 아닙니다."),
    SEAT_ALREADY_HOLD(HttpStatus.CONFLICT, "SEAT_003", "이미 선점된 좌석입니다."),
    SEAT_ALREADY_RESERVED(HttpStatus.CONFLICT, "SEAT_004", "이미 예매된 좌석입니다."),
    SEAT_HOLD_EXPIRED(HttpStatus.BAD_REQUEST, "SEAT_005", "좌석 선점 시간이 만료되었습니다."),
    SEAT_BLOCKED(HttpStatus.BAD_REQUEST, "SEAT_006", "운영에 의해 차단된 좌석입니다."),
    SEAT_DISABLED(HttpStatus.BAD_REQUEST, "SEAT_007", "사용 불가능한 좌석입니다."),
    INVALID_HOLD_TOKEN(HttpStatus.BAD_REQUEST, "SEAT_008", "유효하지 않은 HOLD Token입니다."),
    SEAT_LOCK_FAILED(HttpStatus.CONFLICT, "SEAT_009", "좌석 락 획득에 실패했습니다. 잠시 후 다시 시도해주세요."),

    // ========================================
    // 예매 관련 (RESERVATION)
    // ========================================
    RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "RESERVATION_001", "예매 정보를 찾을 수 없습니다."),
    RESERVATION_ALREADY_CANCELLED(HttpStatus.BAD_REQUEST, "RESERVATION_002", "이미 취소된 예매입니다."),
    RESERVATION_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, "RESERVATION_003", "취소할 수 없는 예매입니다."),

    // ========================================
    // 결제 관련 (PAYMENT)
    // ========================================
    PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "PAYMENT_001", "결제에 실패했습니다."),
    PAYMENT_ALREADY_COMPLETED(HttpStatus.CONFLICT, "PAYMENT_002", "이미 결제가 완료되었습니다."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "PAYMENT_003", "결제 금액이 일치하지 않습니다."),
    PAYMENT_TIMEOUT(HttpStatus.REQUEST_TIMEOUT, "PAYMENT_004", "결제 시간이 초과되었습니다."),

    // ========================================
    // Rate Limit 관련
    // ========================================
    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "RATE_001", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),

    // ========================================
    // 서버/인프라 관련
    // ========================================
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_001", "서버 내부 오류가 발생했습니다."),
    REDIS_CONNECTION_FAILED(HttpStatus.SERVICE_UNAVAILABLE, "SERVER_002", "캐시 서버 연결에 실패했습니다."),
    DATABASE_ERROR(HttpStatus.SERVICE_UNAVAILABLE, "SERVER_003", "데이터베이스 오류가 발생했습니다."),

    // ========================================
    // 유효성 검증 관련
    // ========================================
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "VALIDATION_001", "입력값이 올바르지 않습니다."),
    MISSING_REQUIRED_FIELD(HttpStatus.BAD_REQUEST, "VALIDATION_002", "필수 입력값이 누락되었습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
