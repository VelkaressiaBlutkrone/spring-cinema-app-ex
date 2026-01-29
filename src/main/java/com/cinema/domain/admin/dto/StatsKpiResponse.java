package com.cinema.domain.admin.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 통계 대시보드 KPI 응답 (Step 15)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StatsKpiResponse {

    /** 오늘 매출 (결제 완료 금액 합계) */
    private long todaySales;

    /** 오늘 예매 건수 (CONFIRMED) */
    private long todayBookings;

    /** 오늘 좌석 점유율 (%) — 오늘 상영 기준 예매된 좌석 / 전체 좌석 */
    private BigDecimal todayOccupancyPercent;

    /** 노쇼 예상 금액 (플레이스홀더, 추후 구현) */
    private long todayNoShowAmount;
}
