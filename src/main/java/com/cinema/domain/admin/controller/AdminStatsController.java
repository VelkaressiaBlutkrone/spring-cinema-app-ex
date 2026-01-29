package com.cinema.domain.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.admin.dto.StatsDailyItem;
import com.cinema.domain.admin.dto.StatsKpiResponse;
import com.cinema.domain.admin.dto.StatsTopMovieItem;
import com.cinema.domain.admin.service.AdminStatsService;
import com.cinema.global.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 통계 대시보드 API (Step 15)
 * KPI, 일별 추이, 상영 중 영화 TOP 예매 순위
 */
@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/kpi")
    public ResponseEntity<ApiResponse<StatsKpiResponse>> getKpi() {
        StatsKpiResponse kpi = adminStatsService.getKpi();
        return ResponseEntity.ok(ApiResponse.success(kpi));
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<StatsDailyItem>>> getDailyTrend(
            @RequestParam(value = "days", defaultValue = "30") int days) {
        if (days < 1 || days > 365) {
            days = 30;
        }
        List<StatsDailyItem> items = adminStatsService.getDailyTrend(days);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/top-movies")
    public ResponseEntity<ApiResponse<List<StatsTopMovieItem>>> getTopMoviesByBookings(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        List<StatsTopMovieItem> items = adminStatsService.getTopMoviesByBookings(limit);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
