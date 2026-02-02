package com.cinema.domain.member.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 마이페이지용: 상영별 내 HOLD(장바구니) 요약 응답
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberHoldSummaryResponse {

    private Long screeningId;
    private String movieTitle;
    private String screenName;
    private LocalDateTime startTime;
    private List<HoldSeatItem> seats;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HoldSeatItem {
        private Long seatId;
        private String rowLabel;
        private Integer seatNo;
        private String displayName;
        private String holdToken;
        private LocalDateTime holdExpireAt;
    }
}
