package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningStatus;

import lombok.Getter;

/**
 * 상영 스케줄 응답 DTO
 */
@Getter
public class ScreeningResponse {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private Long screenId;
    private String screenName;
    private String theaterName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ScreeningStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ScreeningResponse(Screening screening) {
        this.id = screening.getId();
        this.movieId = screening.getMovie().getId();
        this.movieTitle = screening.getMovie().getTitle();
        this.screenId = screening.getScreen().getId();
        this.screenName = screening.getScreen().getName();
        this.theaterName = screening.getScreen().getTheater().getName();
        this.startTime = screening.getStartTime();
        this.endTime = screening.getEndTime();
        this.status = screening.getStatus();
        this.createdAt = screening.getCreatedAt();
        this.updatedAt = screening.getUpdatedAt();
    }
}
