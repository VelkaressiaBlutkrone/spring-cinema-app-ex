package com.cinema.domain.home.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.home.dto.HomeStatsResponse;
import com.cinema.domain.home.dto.UpcomingMovieItem;
import com.cinema.domain.home.service.HomeService;
import com.cinema.global.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 메인 화면용 홈 API (Step 10)
 * - 영화관/상영관 현황, 3일 이내 상영 예정 영화 (인증 불필요)
 */
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<HomeStatsResponse>> getStats() {
        HomeStatsResponse stats = homeService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/upcoming-movies")
    public ResponseEntity<ApiResponse<List<UpcomingMovieItem>>> getUpcomingMovies(
            @RequestParam(value = "days", defaultValue = "3") int days) {
        if (days < 1 || days > 30) {
            days = 3;
        }
        List<UpcomingMovieItem> list = homeService.getUpcomingMovies(days);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
