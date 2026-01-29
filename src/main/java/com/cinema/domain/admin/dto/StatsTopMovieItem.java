package com.cinema.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 영화별 예매 순위 항목 (Step 15)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StatsTopMovieItem {

    private Long movieId;
    private String movieTitle;
    private long bookingCount;
}
