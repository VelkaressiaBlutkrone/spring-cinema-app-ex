package com.cinema.domain.screening.dto;

import java.time.LocalDateTime;

import com.cinema.domain.screening.entity.SeatStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 좌석 상태 항목 DTO
 * 좌석 배치 조회 API 응답 및 Redis 캐시 직렬화용
 * Key: seat:status:{screeningId}
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusItem {

    private Long seatId;
    private SeatStatus status;
    private String rowLabel;
    private Integer seatNo;
    private LocalDateTime holdExpireAt; // HOLD인 경우 만료 시각 (클라이언트 타이머용)
}
