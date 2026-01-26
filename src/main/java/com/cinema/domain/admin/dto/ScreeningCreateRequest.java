package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 상영 스케줄 등록 요청 DTO
 */
@Getter
@NoArgsConstructor
public class ScreeningCreateRequest {

    @NotNull(message = "영화 ID는 필수입니다.")
    private Long movieId;

    @NotNull(message = "상영관 ID는 필수입니다.")
    private Long screenId;

    @NotNull(message = "상영 시작 시간은 필수입니다.")
    private LocalDateTime startTime;
}
