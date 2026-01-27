package com.cinema.domain.screening.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.movie.dto.ScreeningRequest;
import com.cinema.domain.movie.service.ScreeningService;
import com.cinema.domain.screening.dto.SeatLayoutResponse;
import com.cinema.domain.screening.service.SeatStatusQueryService;
import com.cinema.global.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 상영 스케줄 API Controller
 *
 * Step 5: GET /api/screenings/{screeningId}/seats - 좌석 배치 조회 (Redis 캐시, DB Fallback)
 */
@RestController
@RequestMapping("/api/screenings")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;
    private final SeatStatusQueryService seatStatusQueryService;

    @PostMapping
    public ResponseEntity<Long> createScreening(@RequestBody ScreeningRequest request) {
        return ResponseEntity.ok(screeningService.createScreening(request));
    }

    /**
     * 좌석 배치·상태 조회 (Step 5)
     * Redis 캐시 우선, 미스/장애 시 DB Fallback
     * Key: seat:status:{screeningId}
     */
    @GetMapping("/{screeningId}/seats")
    public ResponseEntity<ApiResponse<SeatLayoutResponse>> getSeatLayout(
            @PathVariable Long screeningId) {
        SeatLayoutResponse layout = seatStatusQueryService.getSeatLayout(screeningId);
        return ResponseEntity.ok(ApiResponse.success(layout));
    }
}
