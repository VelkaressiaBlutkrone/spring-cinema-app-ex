package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import com.cinema.domain.theater.entity.Theater;
import com.cinema.domain.theater.entity.TheaterStatus;

import lombok.Getter;

/**
 * 영화관 응답 DTO
 */
@Getter
public class TheaterResponse {

    private Long id;
    private String name;
    private String location;
    private String address;
    private String phone;
    private TheaterStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TheaterResponse(Theater theater) {
        this.id = theater.getId();
        this.name = theater.getName();
        this.location = theater.getLocation();
        this.address = theater.getAddress();
        this.phone = theater.getPhone();
        this.status = theater.getStatus();
        this.createdAt = theater.getCreatedAt();
        this.updatedAt = theater.getUpdatedAt();
    }
}
