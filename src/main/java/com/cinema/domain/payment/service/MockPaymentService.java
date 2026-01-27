package com.cinema.domain.payment.service;

import org.springframework.stereotype.Service;

import com.cinema.domain.payment.entity.PaymentMethod;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Mock 결제 서비스 (Step 7)
 *
 * RULE 10.1: 결제는 Mock 시스템 사용
 * - 실제 PG 연동 없이 항상 성공 또는 테스트용 실패 반환
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MockPaymentService {

    /**
     * Mock 결제 처리
     *
     * @param amount    결제 금액 (서버 계산값만 사용)
     * @param payMethod 결제 수단
     * @return 결제 성공 여부 (현재는 항상 true, 실패 시나리오는 payMethod 등으로 제어 가능)
     */
    public boolean processPayment(int amount, PaymentMethod payMethod) {
        log.info("[MockPayment] 결제 요청 - amount={}, payMethod={}", amount, payMethod);
        // Mock: 항상 성공. 실패 테스트 시 payMethod == null 등 조건 추가 가능
        return true;
    }

    /**
     * Mock 결제 실패 시나리오용 (테스트/운영에서 특정 조건 시 실패)
     */
    public boolean processPaymentWithFailure(int amount, PaymentMethod payMethod, boolean forceFail) {
        if (forceFail) {
            log.warn("[MockPayment] 결제 실패 (forceFail=true)");
            return false;
        }
        return processPayment(amount, payMethod);
    }
}
