package com.cinema.domain.screening.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 좌석 HOLD 응답 DTO
 * Step 6: HOLD API 응답
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatHoldResponse {

    private String holdToken;
    private Long screeningId;
    private Long seatId;
    private LocalDateTime holdExpireAt;
    private Long ttlSeconds; // 남은 초 (클라이언트 타이머용)
}
