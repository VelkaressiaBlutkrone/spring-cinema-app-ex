package com.cinema.domain.screening.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 좌석 배치 조회 API 응답 DTO
 * Redis 캐시 저장 단위: seat:status:{screeningId} → 이 객체 JSON
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayoutResponse {

    private Long screeningId;
    private List<SeatStatusItem> seats;
}
