package com.cinema.domain.screening.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 좌석 HOLD 해제 요청 DTO
 * Step 6: HOLD 해제 API 요청
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeatReleaseRequest {

    @NotNull(message = "상영 ID는 필수입니다.")
    private Long screeningId;

    @NotNull(message = "좌석 ID는 필수입니다.")
    private Long seatId;

    @NotBlank(message = "HOLD Token은 필수입니다.")
    private String holdToken;
}
