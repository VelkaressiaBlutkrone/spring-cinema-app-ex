package com.cinema.domain.screening.entity;

import java.time.LocalDateTime;

import com.cinema.domain.member.entity.Member;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.SeatException;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 상영별 좌석 상태 Entity
 *
 * RULE.md 4.1: 좌석 상태 정의 (7단계)
 * - 상태 변경은 SeatCommandService를 통해서만 가능
 * - 상태 전이는 명확한 비즈니스 규칙에 따라만 가능
 */
@Entity
@Table(name = "screening_seat", uniqueConstraints = {
        @UniqueConstraint(name = "uk_screening_seat", columnNames = { "screening_id", "seat_id" })
}, indexes = {
        @Index(name = "idx_screening_seat_status", columnList = "status"),
        @Index(name = "idx_screening_seat_hold_expire", columnList = "hold_expire_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScreeningSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screening_seat_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    /** HOLD 토큰 (UUID) */
    @Column(name = "hold_token", length = 100)
    private String holdToken;

    /** HOLD 회원 ID */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hold_member_id")
    private Member holdMember;

    /** HOLD 만료 시간 */
    @Column(name = "hold_expire_at")
    private LocalDateTime holdExpireAt;

    /** 예매 완료 회원 ID */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserved_member_id")
    private Member reservedMember;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public ScreeningSeat(Screening screening, Seat seat, SeatStatus status) {
        this.screening = screening;
        this.seat = seat;
        this.status = status != null ? status : SeatStatus.AVAILABLE;
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
    // Helper Methods
    // ========================================

    private Long getScreeningId() {
        return screening != null ? screening.getId() : null;
    }

    private Long getSeatId() {
        return seat != null ? seat.getId() : null;
    }

    // ========================================
    // 좌석 상태 변경 메서드 (비즈니스 로직)
    // ========================================

    /**
     * 좌석 HOLD (임시 점유)
     * AVAILABLE -> HOLD
     *
     * @param member      HOLD 요청 회원
     * @param holdToken   HOLD 토큰
     * @param holdMinutes HOLD 유지 시간 (분)
     */
    public void hold(Member member, String holdToken, int holdMinutes) {
        if (!this.status.canHold()) {
            throw SeatException.notAvailable(getScreeningId(), getSeatId());
        }
        this.status = SeatStatus.HOLD;
        this.holdMember = member;
        this.holdToken = holdToken;
        this.holdExpireAt = LocalDateTime.now().plusMinutes(holdMinutes);
    }

    /**
     * HOLD 해제
     * HOLD -> AVAILABLE
     */
    public void releaseHold() {
        if (this.status != SeatStatus.HOLD) {
            return; // 이미 해제된 경우 무시
        }
        this.status = SeatStatus.AVAILABLE;
        clearHoldInfo();
    }

    /**
     * 결제 진행 중
     * HOLD -> PAYMENT_PENDING
     */
    public void startPayment() {
        if (!this.status.canPay()) {
            throw new SeatException(ErrorCode.SEAT_NOT_AVAILABLE, getScreeningId(), getSeatId(),
                    "결제 진행 불가, 현재 상태: " + this.status);
        }
        this.status = SeatStatus.PAYMENT_PENDING;
    }

    /**
     * 예매 확정
     * PAYMENT_PENDING -> RESERVED
     *
     * @param member 예매 확정 회원
     */
    public void reserve(Member member) {
        if (this.status != SeatStatus.PAYMENT_PENDING && this.status != SeatStatus.HOLD) {
            throw SeatException.alreadyReserved(getScreeningId(), getSeatId());
        }
        this.status = SeatStatus.RESERVED;
        this.reservedMember = member;
        clearHoldInfo();
    }

    /**
     * 결제 실패로 인한 해제
     * PAYMENT_PENDING -> AVAILABLE
     */
    public void paymentFailed() {
        if (this.status != SeatStatus.PAYMENT_PENDING) {
            return;
        }
        this.status = SeatStatus.AVAILABLE;
        clearHoldInfo();
    }

    /**
     * 예매 취소
     * RESERVED -> CANCELLED
     */
    public void cancel() {
        if (!this.status.canCancel()) {
            throw new SeatException(ErrorCode.SEAT_NOT_AVAILABLE, getScreeningId(), getSeatId(),
                    "취소 불가, 현재 상태: " + this.status);
        }
        this.status = SeatStatus.CANCELLED;
    }

    /**
     * HOLD 토큰 검증
     */
    public boolean validateHoldToken(String token) {
        return this.holdToken != null && this.holdToken.equals(token);
    }

    /**
     * HOLD 토큰 검증 (예외 발생)
     */
    public void validateHoldTokenOrThrow(String token) {
        if (!validateHoldToken(token)) {
            throw SeatException.invalidHoldToken(getScreeningId(), getSeatId());
        }
    }

    /**
     * HOLD 만료 여부 확인
     */
    public boolean isHoldExpired() {
        if (this.status != SeatStatus.HOLD || this.holdExpireAt == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(this.holdExpireAt);
    }

    /**
     * HOLD 만료 검증 (예외 발생)
     */
    public void validateHoldNotExpiredOrThrow() {
        if (isHoldExpired()) {
            throw SeatException.holdExpired(getScreeningId(), getSeatId());
        }
    }

    // ========================================
    // Private Helper
    // ========================================

    private void clearHoldInfo() {
        this.holdToken = null;
        this.holdMember = null;
        this.holdExpireAt = null;
    }
}
