package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.entity.ScreenStatus;
import com.cinema.domain.screening.entity.ScreenType;

import lombok.Getter;

/**
 * 상영관 응답 DTO
 */
@Getter
public class ScreenResponse {

    private Long id;
    private Long theaterId;
    private String theaterName;
    private String name;
    private Integer totalRows;
    private Integer totalCols;
    private Integer totalSeats;
    private ScreenType screenType;
    private ScreenStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ScreenResponse(Screen screen) {
        this.id = screen.getId();
        this.theaterId = screen.getTheater().getId();
        this.theaterName = screen.getTheater().getName();
        this.name = screen.getName();
        this.totalRows = screen.getTotalRows();
        this.totalCols = screen.getTotalCols();
        this.totalSeats = screen.getTotalSeats();
        this.screenType = screen.getScreenType();
        this.status = screen.getStatus();
        this.createdAt = screen.getCreatedAt();
        this.updatedAt = screen.getUpdatedAt();
    }
}
