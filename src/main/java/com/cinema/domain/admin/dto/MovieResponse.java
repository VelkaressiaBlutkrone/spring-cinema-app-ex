package com.cinema.domain.admin.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.cinema.domain.movie.entity.Movie;
import com.cinema.domain.movie.entity.MovieStatus;

import lombok.Getter;

/**
 * 영화 응답 DTO
 */
@Getter
public class MovieResponse {

    private Long id;
    private String title;
    private String description;
    private Integer runningTime;
    private String rating;
    private String genre;
    private String director;
    private String actors;
    private String posterUrl;
    private LocalDate releaseDate;
    private MovieStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MovieResponse(Movie movie) {
        this.id = movie.getId();
        this.title = movie.getTitle();
        this.description = movie.getDescription();
        this.runningTime = movie.getRunningTime();
        this.rating = movie.getRating();
        this.genre = movie.getGenre();
        this.director = movie.getDirector();
        this.actors = movie.getActors();
        this.posterUrl = movie.getPosterUrl();
        this.releaseDate = movie.getReleaseDate();
        this.status = movie.getStatus();
        this.createdAt = movie.getCreatedAt();
        this.updatedAt = movie.getUpdatedAt();
    }
}
