package com.cinema.domain.reservation.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.cinema.domain.member.entity.Member;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.ReservationException;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예매 Entity (Aggregate Root)
 */
@Entity
@Table(name = "reservation", indexes = {
        @Index(name = "idx_reservation_member", columnList = "member_id"),
        @Index(name = "idx_reservation_screening", columnList = "screening_id"),
        @Index(name = "idx_reservation_status", columnList = "status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    /** 예매 번호 (고유) */
    @Column(name = "reservation_no", nullable = false, unique = true, length = 50)
    private String reservationNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    /** 총 좌석 수 */
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    /** 총 결제 금액 */
    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    /** HOLD 토큰 */
    @Column(name = "hold_token", length = 100)
    private String holdToken;

    /** 예매 좌석 목록 */
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationSeat> reservationSeats = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Reservation(Member member, Screening screening, String holdToken) {
        this.reservationNo = generateReservationNo();
        this.member = member;
        this.screening = screening;
        this.holdToken = holdToken;
        this.status = ReservationStatus.PENDING;
        this.totalSeats = 0;
        this.totalAmount = 0;
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
     * 예매 좌석 추가
     */
    public void addSeat(ReservationSeat reservationSeat) {
        this.reservationSeats.add(reservationSeat);
        this.totalSeats = this.reservationSeats.size();
        recalculateTotalAmount();
    }

    /**
     * 총 금액 재계산
     */
    private void recalculateTotalAmount() {
        this.totalAmount = this.reservationSeats.stream()
                .mapToInt(ReservationSeat::getPrice)
                .sum();
    }

    /**
     * 결제 대기 상태로 전환
     * PENDING -> PAYMENT_PENDING
     */
    public void startPayment() {
        if (this.status != ReservationStatus.PENDING) {
            throw new ReservationException(ErrorCode.RESERVATION_CANNOT_START_PAYMENT, this.id,
                    "현재 상태: " + this.status);
        }
        this.status = ReservationStatus.PAYMENT_PENDING;
    }

    /**
     * 예매 확정
     * PAYMENT_PENDING -> CONFIRMED
     */
    public void confirm() {
        if (this.status != ReservationStatus.PAYMENT_PENDING) {
            throw new ReservationException(ErrorCode.RESERVATION_CANNOT_CONFIRM, this.id,
                    "현재 상태: " + this.status);
        }
        this.status = ReservationStatus.CONFIRMED;
        this.holdToken = null;
    }

    /**
     * 예매 취소
     * CONFIRMED -> CANCELLED
     */
    public void cancel() {
        if (this.status != ReservationStatus.CONFIRMED) {
            throw ReservationException.cannotCancel(this.id, "현재 상태: " + this.status);
        }
        this.status = ReservationStatus.CANCELLED;
    }

    /**
     * 환불 처리
     * CANCELLED -> REFUNDED
     */
    public void refund() {
        if (this.status != ReservationStatus.CANCELLED) {
            throw new ReservationException(ErrorCode.RESERVATION_CANNOT_REFUND, this.id,
                    "현재 상태: " + this.status);
        }
        this.status = ReservationStatus.REFUNDED;
    }

    /**
     * 결제 실패로 인한 초기화
     */
    public void paymentFailed() {
        if (this.status != ReservationStatus.PAYMENT_PENDING) {
            return;
        }
        this.status = ReservationStatus.PENDING;
    }

    // ========================================
    // Helper
    // ========================================

    private String generateReservationNo() {
        return "R" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
