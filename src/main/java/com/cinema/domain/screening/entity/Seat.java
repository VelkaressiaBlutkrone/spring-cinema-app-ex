package com.cinema.domain.screening.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
 * 좌석 Entity (상영관에 속함)
 *
 * 좌석의 기본 정보 및 관리자가 설정하는 기본 상태를 관리
 * 실제 상영별 좌석 상태는 ScreeningSeat에서 관리
 */
@Entity
@Table(name = "seat", uniqueConstraints = {
        @UniqueConstraint(name = "uk_seat_position", columnNames = { "screen_id", "row_label", "seat_no" })
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id", nullable = false)
    private Screen screen;

    @Column(name = "row_label", nullable = false, length = 5)
    private String rowLabel; // A, B, C, ...

    @Column(name = "seat_no", nullable = false)
    private Integer seatNo; // 1, 2, 3, ...

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType;

    /** 기본 상태 (관리자 설정) - AVAILABLE, BLOCKED, DISABLED */
    @Enumerated(EnumType.STRING)
    @Column(name = "base_status", nullable = false)
    private SeatBaseStatus baseStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Seat(Screen screen, String rowLabel, Integer seatNo, SeatType seatType) {
        this.screen = screen;
        this.rowLabel = rowLabel;
        this.seatNo = seatNo;
        this.seatType = seatType;
        this.baseStatus = SeatBaseStatus.AVAILABLE;
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

    // 비즈니스 메서드 (관리자용)
    public void block() {
        this.baseStatus = SeatBaseStatus.BLOCKED;
    }

    public void disable() {
        this.baseStatus = SeatBaseStatus.DISABLED;
    }

    public void enable() {
        this.baseStatus = SeatBaseStatus.AVAILABLE;
    }

    public boolean isAvailable() {
        return this.baseStatus == SeatBaseStatus.AVAILABLE;
    }

    /**
     * 좌석 표시명 (예: A1, B5)
     */
    public String getDisplayName() {
        return rowLabel + seatNo;
    }

    /**
     * 좌석 정보 수정
     */
    public void updateInfo(SeatType seatType) {
        if (seatType != null) {
            this.seatType = seatType;
        }
    }
}
