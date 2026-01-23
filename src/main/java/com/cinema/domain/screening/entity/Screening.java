package com.cinema.domain.screening.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.cinema.domain.movie.entity.Movie;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.ScreeningException;
import com.cinema.global.exception.SeatException;

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
 * 상영 스케줄 Entity (Aggregate Root)
 * 
 * RULE 3.2: 좌석은 반드시 Screening Aggregate 소속
 * - 좌석 상태 변경은 Screening을 통해서만 가능
 */
@Entity
@Table(name = "screening", indexes = {
    @Index(name = "idx_screening_time", columnList = "start_time, end_time"),
    @Index(name = "idx_screening_status", columnList = "status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screening_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id", nullable = false)
    private Screen screen;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScreeningStatus status;

    /** 상영별 좌석 상태 목록 (Aggregate 하위 Entity) */
    @OneToMany(mappedBy = "screening", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScreeningSeat> screeningSeats = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Screening(Movie movie, Screen screen, LocalDateTime startTime, LocalDateTime endTime) {
        this.movie = movie;
        this.screen = screen;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = ScreeningStatus.SCHEDULED;
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
    // 비즈니스 메서드 (상태 변경)
    // ========================================

    public void start() {
        if (this.status != ScreeningStatus.SCHEDULED) {
            throw ScreeningException.invalidState(this.id, this.status.name(), "상영 시작");
        }
        this.status = ScreeningStatus.NOW_SHOWING;
    }

    public void end() {
        this.status = ScreeningStatus.ENDED;
    }

    public void cancel() {
        if (this.status == ScreeningStatus.ENDED) {
            throw ScreeningException.ended(this.id);
        }
        this.status = ScreeningStatus.CANCELLED;
    }

    // ========================================
    // 좌석 관련 비즈니스 메서드 (Aggregate Root 역할)
    // ========================================

    /**
     * 상영 좌석 추가
     */
    public void addScreeningSeat(ScreeningSeat screeningSeat) {
        this.screeningSeats.add(screeningSeat);
    }

    /**
     * 특정 좌석 조회
     */
    public ScreeningSeat findSeat(Long seatId) {
        return screeningSeats.stream()
                .filter(ss -> ss.getSeat().getId().equals(seatId))
                .findFirst()
                .orElseThrow(() -> new SeatException(ErrorCode.SEAT_NOT_FOUND, this.id, seatId));
    }

    /**
     * 예매 가능 여부 확인
     */
    public boolean isBookable() {
        return this.status == ScreeningStatus.SCHEDULED && 
               this.startTime.isAfter(LocalDateTime.now());
    }

    /**
     * 예매 가능 여부 검증 (예외 발생)
     */
    public void validateBookable() {
        if (!isBookable()) {
            throw new ScreeningException(ErrorCode.SCREENING_NOT_BOOKABLE, this.id,
                    "현재 상태: " + this.status);
        }
    }

    /**
     * 예매 가능 좌석 수 조회
     */
    public long getAvailableSeatCount() {
        return screeningSeats.stream()
                .filter(ss -> ss.getStatus() == SeatStatus.AVAILABLE)
                .count();
    }
}
