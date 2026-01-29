package com.cinema.domain.admin.controller;

import java.time.LocalDate;
import java.util.List;

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

import com.cinema.domain.admin.dto.PaymentListResponse;
import com.cinema.domain.admin.dto.StatsDailyItem;
import com.cinema.domain.admin.dto.StatsKpiResponse;
import com.cinema.domain.admin.dto.StatsTopMovieItem;
import com.cinema.domain.admin.service.AdminPaymentService;
import com.cinema.domain.admin.service.AdminStatsService;
import com.cinema.domain.payment.entity.PaymentStatus;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.dto.PageResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 결제 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;
    private final AdminStatsService adminStatsService;

    /**
     * 결제 목록 조회 (필터링, 정렬, 페이지네이션)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentListResponse>>> getPayments(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "payStatus", required = false) PaymentStatus payStatus,
            @RequestParam(value = "memberId", required = false) Long memberId,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<PaymentListResponse> page = adminPaymentService.getPayments(
                startDate, endDate, payStatus, memberId, pageable);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    // ========================================
    // 통계 대시보드 (Step 15) — /api/admin/payments/dashboard/**
    // ========================================

    @GetMapping("/dashboard/kpi")
    public ResponseEntity<ApiResponse<StatsKpiResponse>> getDashboardKpi() {
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getKpi()));
    }

    @GetMapping("/dashboard/daily")
    public ResponseEntity<ApiResponse<List<StatsDailyItem>>> getDashboardDaily(
            @RequestParam(value = "days", defaultValue = "30") int days) {
        if (days < 1 || days > 365) {
            days = 30;
        }
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getDailyTrend(days)));
    }

    @GetMapping("/dashboard/top-movies")
    public ResponseEntity<ApiResponse<List<StatsTopMovieItem>>> getDashboardTopMovies(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getTopMoviesByBookings(limit)));
    }

    /**
     * 결제 상세 조회
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentListResponse>> getPaymentDetail(
            @PathVariable("paymentId") Long paymentId) {

        PaymentListResponse detail = adminPaymentService.getPaymentDetail(paymentId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    /**
     * 취소된 결제 내역 조회
     */
    @GetMapping("/cancelled")
    public ResponseEntity<ApiResponse<PageResponse<PaymentListResponse>>> getCancelledPayments(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<PaymentListResponse> page = adminPaymentService.getCancelledPayments(
                startDate, endDate, pageable);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }
}
