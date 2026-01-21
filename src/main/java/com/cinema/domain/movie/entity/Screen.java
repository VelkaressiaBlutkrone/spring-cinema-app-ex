package com.cinema.domain.movie.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Screen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screen_id")
    private Long id;

    // Theater 연관관계는 생략하거나 ID만 참조 (여기서는 단순화)
    @Column(name = "theater_id", nullable = false)
    private Long theaterId;

    @Column(nullable = false)
    private String name; // "1관", "IMAX관"

    @Column(name = "total_seat", nullable = false)
    private Integer totalSeat;
}