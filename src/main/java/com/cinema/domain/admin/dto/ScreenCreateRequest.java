package com.cinema.domain.admin.dto;

import com.cinema.domain.screening.entity.ScreenType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 상영관 등록 요청 DTO
 */
@Getter
@NoArgsConstructor
public class ScreenCreateRequest {

    @NotNull(message = "영화관 ID는 필수입니다.")
    private Long theaterId;

    @NotBlank(message = "상영관 이름은 필수입니다.")
    private String name;

    @NotNull(message = "총 행 수는 필수입니다.")
    @Positive(message = "총 행 수는 양수여야 합니다.")
    private Integer totalRows;

    @NotNull(message = "행당 좌석 수는 필수입니다.")
    @Positive(message = "행당 좌석 수는 양수여야 합니다.")
    private Integer totalCols;

    @NotNull(message = "상영관 타입은 필수입니다.")
    private ScreenType screenType;
}
