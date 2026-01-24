package com.cinema.domain.reservation.entity;

/**
 * 예매 상태 Enum
 */
public enum ReservationStatus {

    /** 예매 대기 (좌석 HOLD 상태) */
    PENDING,

    /** 결제 진행 중 */
    PAYMENT_PENDING,

    /** 예매 확정 (결제 완료) */
    CONFIRMED,

    /** 예매 취소 */
    CANCELLED,

    /** 환불 완료 */
    REFUNDED
}
