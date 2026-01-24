package com.cinema.global.exception;

import lombok.Getter;

/**
 * 결제 관련 예외
 */
@Getter
public class PaymentException extends BusinessException {

    private final Long paymentId;
    private final Long reservationId;

    public PaymentException(ErrorCode errorCode) {
        super(errorCode);
        this.paymentId = null;
        this.reservationId = null;
    }

    public PaymentException(ErrorCode errorCode, Long paymentId, Long reservationId) {
        super(errorCode, String.format("paymentId=%d, reservationId=%d", paymentId, reservationId));
        this.paymentId = paymentId;
        this.reservationId = reservationId;
    }

    public PaymentException(ErrorCode errorCode, String additionalMessage) {
        super(errorCode, additionalMessage);
        this.paymentId = null;
        this.reservationId = null;
    }

    // 정적 팩토리 메서드
    public static PaymentException failed() {
        return new PaymentException(ErrorCode.PAYMENT_FAILED);
    }

    public static PaymentException alreadyCompleted(Long paymentId) {
        return new PaymentException(ErrorCode.PAYMENT_ALREADY_COMPLETED,
                String.format("paymentId=%d", paymentId));
    }

    public static PaymentException amountMismatch(Long paymentId, int expected, int actual) {
        return new PaymentException(ErrorCode.PAYMENT_AMOUNT_MISMATCH,
                String.format("paymentId=%d, expected=%d, actual=%d", paymentId, expected, actual));
    }

    public static PaymentException timeout(Long paymentId) {
        return new PaymentException(ErrorCode.PAYMENT_TIMEOUT,
                String.format("paymentId=%d", paymentId));
    }

    public static PaymentException invalidState(String currentStatus, String expectedStatus) {
        return new PaymentException(ErrorCode.PAYMENT_FAILED,
                String.format("현재 상태: %s, 필요한 상태: %s", currentStatus, expectedStatus));
    }
}
