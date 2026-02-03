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
        boolean result = mockPaymentService.processPayment(10000, PaymentMethod.CARD);
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("processPaymentWithFailure - forceFail=false면_성공")
    void processPaymentWithFailure_noForceFail_succeeds() {
        boolean result = mockPaymentService.processPaymentWithFailure(10000, PaymentMethod.CARD, false);
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("processPaymentWithFailure - forceFail=true면_실패")
    void processPaymentWithFailure_forceFail_fails() {
        boolean result = mockPaymentService.processPaymentWithFailure(10000, PaymentMethod.CARD, true);
        assertThat(result).isFalse();
    }
}
