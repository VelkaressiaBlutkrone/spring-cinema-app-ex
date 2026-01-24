package com.cinema.domain.screening.entity;

/**
 * 좌석 상태 Enum (7단계)
 *
 * RULE.md 4.1: 좌석 상태 정의
 * - 임의 상태 추가 금지
 * - 상태 전이는 명확한 비즈니스 규칙에 따라만 가능
 */
public enum SeatStatus {

    /** 예매 가능 */
    AVAILABLE,

    /** 임시 점유 (HOLD) */
    HOLD,

    /** PG 요청 중 (결제 진행 중) */
    PAYMENT_PENDING,

    /** 결제 완료 */
    RESERVED,

    /** 예매 취소 */
    CANCELLED,

    /** 운영 차단 (관리자 설정) */
    BLOCKED,

    /** 물리적 사용 불가 (관리자 설정) */
    DISABLED;

    /**
     * HOLD 가능한 상태인지 확인
     */
    public boolean canHold() {
        return this == AVAILABLE;
    }

    /**
     * 결제 진행 가능한 상태인지 확인
     */
    public boolean canPay() {
        return this == HOLD;
    }

    /**
     * 예매 취소 가능한 상태인지 확인
     */
    public boolean canCancel() {
        return this == RESERVED;
    }

    /**
     * 선택 가능한 상태인지 확인 (사용자 입장)
     */
    public boolean isSelectable() {
        return this == AVAILABLE;
    }

    /**
     * 점유된 상태인지 확인
     */
    public boolean isOccupied() {
        return this == HOLD || this == PAYMENT_PENDING || this == RESERVED;
    }
}
