package com.cinema.domain.payment.entity;

/**
 * 결제 수단 Enum
 */
public enum PaymentMethod {

    /** 신용카드 */
    CARD("신용카드"),

    /** 카카오페이 */
    KAKAO_PAY("카카오페이"),

    /** 네이버페이 */
    NAVER_PAY("네이버페이"),

    /** 토스 */
    TOSS("토스"),

    /** 계좌이체 */
    BANK_TRANSFER("계좌이체");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
