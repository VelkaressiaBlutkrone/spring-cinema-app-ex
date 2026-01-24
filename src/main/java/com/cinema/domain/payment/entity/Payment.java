package com.cinema.domain.payment.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.PaymentException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 결제 Entity
 *
 * RULE.md 10: 결제 규칙
 * - Mock 결제 시스템 사용
 * - 결제 정보는 서버에서만 검증
 */
@Entity
@Table(name = "payment", indexes = {
        @Index(name = "idx_payment_reservation", columnList = "reservation_id"),
        @Index(name = "idx_payment_status", columnList = "pay_status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    /** 결제 번호 (고유) */
    @Column(name = "payment_no", nullable = false, unique = true, length = 50)
    private String paymentNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_method", nullable = false)
    private PaymentMethod payMethod;

    /** 결제 금액 */
    @Column(name = "pay_amount", nullable = false)
    private Integer payAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_status", nullable = false)
    private PaymentStatus payStatus;

    /** PG 거래 ID (Mock) */
    @Column(name = "pg_transaction_id", length = 100)
    private String pgTransactionId;

    /** 결제 완료 시간 */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /** 취소 시간 */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Payment(Reservation reservation, PaymentMethod payMethod, Integer payAmount) {
        this.paymentNo = generatePaymentNo();
        this.reservation = reservation;
        this.payMethod = payMethod;
        this.payAmount = payAmount;
        this.payStatus = PaymentStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ========================================
    // 비즈니스 메서드
    // ========================================

    /**
     * 결제 성공 처리
     * PENDING -> SUCCESS
     */
    public void success(String pgTransactionId) {
        if (this.payStatus != PaymentStatus.PENDING) {
            throw new PaymentException(ErrorCode.PAYMENT_CANNOT_COMPLETE,
                    String.format("paymentId=%d, 현재 상태: %s", this.id, this.payStatus));
        }
        this.payStatus = PaymentStatus.SUCCESS;
        this.pgTransactionId = pgTransactionId;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * 결제 실패 처리
     * PENDING -> FAILED
     */
    public void fail() {
        if (this.payStatus != PaymentStatus.PENDING) {
            throw new PaymentException(ErrorCode.PAYMENT_FAILED,
                    String.format("paymentId=%d, 현재 상태: %s", this.id, this.payStatus));
        }
        this.payStatus = PaymentStatus.FAILED;
    }

    /**
     * 결제 취소
     * SUCCESS -> CANCELLED
     */
    public void cancel() {
        if (this.payStatus != PaymentStatus.SUCCESS) {
            throw new PaymentException(ErrorCode.PAYMENT_CANNOT_CANCEL,
                    String.format("paymentId=%d, 현재 상태: %s", this.id, this.payStatus));
        }
        this.payStatus = PaymentStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
    }

    /**
     * 환불 처리
     * CANCELLED -> REFUNDED
     */
    public void refund() {
        if (this.payStatus != PaymentStatus.CANCELLED) {
            throw new PaymentException(ErrorCode.PAYMENT_CANNOT_REFUND,
                    String.format("paymentId=%d, 현재 상태: %s", this.id, this.payStatus));
        }
        this.payStatus = PaymentStatus.REFUNDED;
    }

    // ========================================
    // Helper
    // ========================================

    private String generatePaymentNo() {
        return "P" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
