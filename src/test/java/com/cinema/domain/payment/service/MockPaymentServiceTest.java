package com.cinema.domain.payment.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.cinema.domain.payment.entity.PaymentMethod;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("MockPaymentService 단위 테스트")
class MockPaymentServiceTest {

    private final MockPaymentService mockPaymentService = new MockPaymentService();

    @Test
    @DisplayName("processPayment - 항상_성공")
    void processPayment_alwaysSucceeds() {
        // given: 금액 10000, 결제수단 CARD
        // when: processPayment 호출
        boolean result = mockPaymentService.processPayment(10000, PaymentMethod.CARD);
        // then: 항상 true 반환
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("processPaymentWithFailure - forceFail=false면_성공")
    void processPaymentWithFailure_noForceFail_succeeds() {
        // given: 금액 10000, CARD, forceFail=false
        // when: processPaymentWithFailure 호출
        boolean result = mockPaymentService.processPaymentWithFailure(10000, PaymentMethod.CARD, false);
        // then: true 반환
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("processPaymentWithFailure - forceFail=true면_실패")
    void processPaymentWithFailure_forceFail_fails() {
        // given: 금액 10000, CARD, forceFail=true
        // when: processPaymentWithFailure 호출
        boolean result = mockPaymentService.processPaymentWithFailure(10000, PaymentMethod.CARD, true);
        // then: false 반환
        assertThat(result).isFalse();
    }
}
