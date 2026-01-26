package com.cinema.domain.admin.dto;

import com.cinema.domain.screening.entity.SeatBaseStatus;
import com.cinema.domain.screening.entity.SeatType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 좌석 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class SeatUpdateRequest {

    private SeatType seatType;

    @NotNull(message = "좌석 기본 상태는 필수입니다.")
    private SeatBaseStatus baseStatus;
}
