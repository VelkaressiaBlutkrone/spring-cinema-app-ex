package com.cinema.domain.movie.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Movie {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "running_time", nullable = false)
    private Integer runningTime; // 분 단위

    private String rating; // 등급 (12세, 15세 등)
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    public Movie(String title, Integer runningTime, String rating, LocalDate releaseDate) {
        this.title = title;
        this.runningTime = runningTime;
        this.rating = rating;
        this.releaseDate = releaseDate;
        this.status = MovieStatus.OPEN;
    }
}