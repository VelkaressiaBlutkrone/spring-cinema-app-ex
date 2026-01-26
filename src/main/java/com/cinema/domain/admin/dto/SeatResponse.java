package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import com.cinema.domain.screening.entity.Seat;
import com.cinema.domain.screening.entity.SeatBaseStatus;
import com.cinema.domain.screening.entity.SeatType;

import lombok.Getter;

/**
 * 좌석 응답 DTO
 */
@Getter
public class SeatResponse {

    private Long id;
    private Long screenId;
    private String screenName;
    private String rowLabel;
    private Integer seatNo;
    private String displayName;
    private SeatType seatType;
    private SeatBaseStatus baseStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SeatResponse(Seat seat) {
        this.id = seat.getId();
        this.screenId = seat.getScreen().getId();
        this.screenName = seat.getScreen().getName();
        this.rowLabel = seat.getRowLabel();
        this.seatNo = seat.getSeatNo();
        this.displayName = seat.getDisplayName();
        this.seatType = seat.getSeatType();
        this.baseStatus = seat.getBaseStatus();
        this.createdAt = seat.getCreatedAt();
        this.updatedAt = seat.getUpdatedAt();
    }
}
