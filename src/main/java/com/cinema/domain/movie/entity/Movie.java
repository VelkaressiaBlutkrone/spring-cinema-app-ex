package com.cinema.domain.movie.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 영화 Entity
 */
@Entity
@Table(name = "movie", indexes = {
    @Index(name = "idx_movie_status", columnList = "status"),
    @Index(name = "idx_movie_release", columnList = "release_date")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    private String description;

    /** 상영 시간 (분) */
    @Column(name = "running_time", nullable = false)
    private Integer runningTime;

    /** 관람 등급 */
    @Column(length = 20)
    private String rating;

    /** 장르 */
    @Column(length = 50)
    private String genre;

    /** 감독 */
    @Column(length = 100)
    private String director;

    /** 출연 배우 */
    @Lob
    private String actors;

    /** 포스터 URL */
    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    /** 개봉일 */
    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovieStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Movie(String title, String description, Integer runningTime, String rating, 
                 String genre, String director, String actors, String posterUrl, LocalDate releaseDate) {
        this.title = title;
        this.description = description;
        this.runningTime = runningTime;
        this.rating = rating;
        this.genre = genre;
        this.director = director;
        this.actors = actors;
        this.posterUrl = posterUrl;
        this.releaseDate = releaseDate;
        this.status = MovieStatus.SHOWING;
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
    public void end() {
        this.status = MovieStatus.ENDED;
    }

    public void comingSoon() {
        this.status = MovieStatus.COMING_SOON;
    }

    public void showing() {
        this.status = MovieStatus.SHOWING;
    }

    public void updateInfo(String title, String description, Integer runningTime, 
                           String rating, String genre, String director, String actors, String posterUrl) {
        this.title = title;
        this.description = description;
        this.runningTime = runningTime;
        this.rating = rating;
        this.genre = genre;
        this.director = director;
        this.actors = actors;
        this.posterUrl = posterUrl;
    }
}
