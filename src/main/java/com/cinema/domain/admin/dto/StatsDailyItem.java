package com.cinema.domain.admin.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 일별 통계 항목 (Step 15)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StatsDailyItem {

    private LocalDate date;
    private long sales;
    private long bookings;
}
