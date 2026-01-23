package com.cinema.domain.screening.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.cinema.domain.theater.entity.Theater;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 상영관 Entity
 */
@Entity
@Table(name = "screen")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screen_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(nullable = false, length = 50)
    private String name;  // "1관", "IMAX관"

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "total_cols", nullable = false)
    private Integer totalCols;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Enumerated(EnumType.STRING)
    @Column(name = "screen_type", nullable = false)
    private ScreenType screenType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScreenStatus status;

    @OneToMany(mappedBy = "screen", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Seat> seats = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Screen(Theater theater, String name, Integer totalRows, Integer totalCols, ScreenType screenType) {
        this.theater = theater;
        this.name = name;
        this.totalRows = totalRows;
        this.totalCols = totalCols;
        this.totalSeats = totalRows * totalCols;
        this.screenType = screenType;
        this.status = ScreenStatus.OPEN;
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

    // 비즈니스 메서드
    public void close() {
        this.status = ScreenStatus.CLOSED;
    }

    public void open() {
        this.status = ScreenStatus.OPEN;
    }

    public void maintenance() {
        this.status = ScreenStatus.MAINTENANCE;
    }

    public void addSeat(Seat seat) {
        this.seats.add(seat);
    }
}
