package com.cinema.domain.home.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메인 화면용 영화관/상영관 현황 요약 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HomeStatsResponse {

    private long theaterCount;
    private long screenCount;
    private long todayScreeningCount;
}
