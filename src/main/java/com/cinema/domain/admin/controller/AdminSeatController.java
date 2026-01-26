package com.cinema.domain.admin.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.admin.dto.SeatCreateRequest;
import com.cinema.domain.admin.dto.SeatResponse;
import com.cinema.domain.admin.dto.SeatUpdateRequest;
import com.cinema.domain.admin.service.AdminSeatService;
import com.cinema.global.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 좌석 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/seats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSeatController {

    private final AdminSeatService adminSeatService;

    /**
     * 좌석 등록
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createSeat(
            @Validated @RequestBody SeatCreateRequest request) {
        Long seatId = adminSeatService.createSeat(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(seatId));
    }

    /**
     * 좌석 수정
     */
    @PutMapping("/{seatId}")
    public ResponseEntity<ApiResponse<Void>> updateSeat(
            @PathVariable Long seatId,
            @Validated @RequestBody SeatUpdateRequest request) {
        adminSeatService.updateSeat(seatId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 좌석 삭제
     */
    @DeleteMapping("/{seatId}")
    public ResponseEntity<ApiResponse<Void>> deleteSeat(@PathVariable Long seatId) {
        adminSeatService.deleteSeat(seatId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 좌석 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<SeatResponse>>> getSeats(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<SeatResponse> seats = adminSeatService.getSeats(pageable);
        return ResponseEntity.ok(ApiResponse.success(seats));
    }

    /**
     * 좌석 상세 조회
     */
    @GetMapping("/{seatId}")
    public ResponseEntity<ApiResponse<SeatResponse>> getSeat(@PathVariable Long seatId) {
        SeatResponse seat = adminSeatService.getSeat(seatId);
        return ResponseEntity.ok(ApiResponse.success(seat));
    }

    /**
     * 특정 상영관의 좌석 목록 조회
     */
    @GetMapping("/by-screen")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getSeatsByScreen(
            @RequestParam Long screenId) {
        List<SeatResponse> seats = adminSeatService.getSeatsByScreen(screenId);
        return ResponseEntity.ok(ApiResponse.success(seats));
    }
}
