package com.cinema.global.exception;

import lombok.Getter;

/**
 * 좌석 관련 예외 (핵심 도메인 예외)
 */
@Getter
public class SeatException extends BusinessException {

    private final Long screeningId;
    private final Long seatId;

    public SeatException(ErrorCode errorCode, Long screeningId, Long seatId) {
        super(errorCode, String.format("screeningId=%d, seatId=%d", screeningId, seatId));
        this.screeningId = screeningId;
        this.seatId = seatId;
    }

    public SeatException(ErrorCode errorCode, Long screeningId, Long seatId, String additionalMessage) {
        super(errorCode, String.format("screeningId=%d, seatId=%d, %s", screeningId, seatId, additionalMessage));
        this.screeningId = screeningId;
        this.seatId = seatId;
    }

    // 정적 팩토리 메서드
    public static SeatException notAvailable(Long screeningId, Long seatId) {
        return new SeatException(ErrorCode.SEAT_NOT_AVAILABLE, screeningId, seatId);
    }

    public static SeatException alreadyHold(Long screeningId, Long seatId) {
        return new SeatException(ErrorCode.SEAT_ALREADY_HOLD, screeningId, seatId);
    }

    public static SeatException alreadyReserved(Long screeningId, Long seatId) {
        return new SeatException(ErrorCode.SEAT_ALREADY_RESERVED, screeningId, seatId);
    }

    public static SeatException holdExpired(Long screeningId, Long seatId) {
        return new SeatException(ErrorCode.SEAT_HOLD_EXPIRED, screeningId, seatId);
    }

    public static SeatException lockFailed(Long screeningId, Long seatId) {
        return new SeatException(ErrorCode.SEAT_LOCK_FAILED, screeningId, seatId);
    }

    public static SeatException invalidHoldToken(Long screeningId, Long seatId) {
        return new SeatException(ErrorCode.INVALID_HOLD_TOKEN, screeningId, seatId);
    }
}
