package com.cinema.domain.admin.dto;

import com.cinema.domain.screening.entity.SeatType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 좌석 등록 요청 DTO
 */
@Getter
@NoArgsConstructor
public class SeatCreateRequest {

    @NotNull(message = "상영관 ID는 필수입니다.")
    private Long screenId;

    @NotBlank(message = "행 라벨은 필수입니다.")
    private String rowLabel;

    @NotNull(message = "좌석 번호는 필수입니다.")
    @Positive(message = "좌석 번호는 양수여야 합니다.")
    private Integer seatNo;

    @NotNull(message = "좌석 타입은 필수입니다.")
    private SeatType seatType;
}
