package com.cinema.domain.admin.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.admin.dto.ReservationListResponse;
import com.cinema.domain.admin.service.AdminReservationService;
import com.cinema.domain.reservation.dto.ReservationDetailResponse;
import com.cinema.domain.reservation.entity.ReservationStatus;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.dto.PageResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 예매 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {

    private final AdminReservationService adminReservationService;

    /**
     * 예매 목록 조회 (필터링, 정렬, 페이지네이션)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReservationListResponse>>> getReservations(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "movieId", required = false) Long movieId,
            @RequestParam(value = "memberId", required = false) Long memberId,
            @RequestParam(value = "status", required = false) ReservationStatus status,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ReservationListResponse> page = adminReservationService.getReservations(
                startDate, endDate, movieId, memberId, status, pageable);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    /**
     * 예매 상세 조회
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<ApiResponse<ReservationDetailResponse>> getReservationDetail(
            @PathVariable("reservationId") Long reservationId) {

        ReservationDetailResponse detail = adminReservationService.getReservationDetail(reservationId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    /**
     * 취소 내역 조회
     */
    @GetMapping("/cancelled")
    public ResponseEntity<ApiResponse<PageResponse<ReservationListResponse>>> getCancelledReservations(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ReservationListResponse> page = adminReservationService.getCancelledReservations(
                startDate, endDate, pageable);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }
}
