package com.cinema.global.exception;

import lombok.Getter;

/**
 * 예매 관련 예외
 */
@Getter
public class ReservationException extends BusinessException {

    private final Long reservationId;
    private final String reservationNo;

    public ReservationException(ErrorCode errorCode) {
        super(errorCode);
        this.reservationId = null;
        this.reservationNo = null;
    }

    public ReservationException(ErrorCode errorCode, Long reservationId) {
        super(errorCode, String.format("reservationId=%d", reservationId));
        this.reservationId = reservationId;
        this.reservationNo = null;
    }

    public ReservationException(ErrorCode errorCode, String reservationNo) {
        super(errorCode, String.format("reservationNo=%s", reservationNo));
        this.reservationId = null;
        this.reservationNo = reservationNo;
    }

    public ReservationException(ErrorCode errorCode, Long reservationId, String additionalMessage) {
        super(errorCode, String.format("reservationId=%d, %s", reservationId, additionalMessage));
        this.reservationId = reservationId;
        this.reservationNo = null;
    }

    // 정적 팩토리 메서드
    public static ReservationException notFound(Long reservationId) {
        return new ReservationException(ErrorCode.RESERVATION_NOT_FOUND, reservationId);
    }

    public static ReservationException notFoundByNo(String reservationNo) {
        return new ReservationException(ErrorCode.RESERVATION_NOT_FOUND, reservationNo);
    }

    public static ReservationException alreadyCancelled(Long reservationId) {
        return new ReservationException(ErrorCode.RESERVATION_ALREADY_CANCELLED, reservationId);
    }

    public static ReservationException cannotCancel(Long reservationId, String reason) {
        return new ReservationException(ErrorCode.RESERVATION_CANNOT_CANCEL, reservationId, reason);
    }

    public static ReservationException invalidState(Long reservationId, String currentStatus, String expectedStatus) {
        return new ReservationException(ErrorCode.RESERVATION_CANNOT_CANCEL, reservationId, 
                String.format("현재 상태: %s, 필요한 상태: %s", currentStatus, expectedStatus));
    }
}
