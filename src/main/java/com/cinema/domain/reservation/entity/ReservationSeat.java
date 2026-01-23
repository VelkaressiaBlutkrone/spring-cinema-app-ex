package com.cinema.domain.reservation.entity;

import java.time.LocalDateTime;

import com.cinema.domain.screening.entity.Seat;
import com.cinema.domain.screening.entity.ScreeningSeat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예매 좌석 Entity
 */
@Entity
@Table(name = "reservation_seat", uniqueConstraints = {
    @UniqueConstraint(name = "uk_reservation_seat", columnNames = {"reservation_id", "seat_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReservationSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_seat_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_seat_id", nullable = false)
    private ScreeningSeat screeningSeat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    /** 좌석 가격 (예매 시점 가격 스냅샷) */
    @Column(nullable = false)
    private Integer price;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ReservationSeat(Reservation reservation, ScreeningSeat screeningSeat, Seat seat, Integer price) {
        this.reservation = reservation;
        this.screeningSeat = screeningSeat;
        this.seat = seat;
        this.price = price;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 좌석 표시명 (예: A1)
     */
    public String getSeatDisplayName() {
        return seat.getDisplayName();
    }
}
