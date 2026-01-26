package com.cinema.domain.admin.dto;

import com.cinema.domain.screening.entity.ScreenType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 상영관 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class ScreenUpdateRequest {

    @NotBlank(message = "상영관 이름은 필수입니다.")
    private String name;

    @Positive(message = "총 행 수는 양수여야 합니다.")
    private Integer totalRows;

    @Positive(message = "행당 좌석 수는 양수여야 합니다.")
    private Integer totalCols;

    private ScreenType screenType;
}
