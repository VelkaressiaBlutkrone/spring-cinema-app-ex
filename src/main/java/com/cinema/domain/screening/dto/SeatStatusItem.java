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
 * 인증 요청 시 "내 HOLD"에 한해 holdToken, isHeldByCurrentUser 후처리로 설정 (캐시에는 미포함)
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
    /** 현재 사용자 소유 HOLD일 때만 설정 (인증 요청 후처리) */
    private String holdToken;
    /** 현재 사용자 소유 HOLD 여부 (인증 요청 후처리) */
    private Boolean isHeldByCurrentUser;
}
