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

import com.cinema.domain.admin.dto.ScreeningCreateRequest;
import com.cinema.domain.admin.dto.ScreeningResponse;
import com.cinema.domain.admin.dto.ScreeningUpdateRequest;
import com.cinema.domain.admin.service.AdminScreeningService;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.dto.PageResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 상영 스케줄 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/screenings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminScreeningController {

    private final AdminScreeningService adminScreeningService;

    /**
     * 상영 스케줄 등록
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createScreening(
            @Validated @RequestBody ScreeningCreateRequest request) {
        Long screeningId = adminScreeningService.createScreening(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(screeningId));
    }

    /**
     * 상영 스케줄 수정
     */
    @PutMapping("/{screeningId}")
    public ResponseEntity<ApiResponse<Void>> updateScreening(
            @PathVariable Long screeningId,
            @Validated @RequestBody ScreeningUpdateRequest request) {
        adminScreeningService.updateScreening(screeningId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 상영 스케줄 삭제
     */
    @DeleteMapping("/{screeningId}")
    public ResponseEntity<ApiResponse<Void>> deleteScreening(@PathVariable Long screeningId) {
        adminScreeningService.deleteScreening(screeningId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 상영 스케줄 목록 조회 (페이징)
     * Page 대신 PageResponse 사용 (Gson이 PageImpl을 올바르게 직렬화하지 못하는 문제 회피)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ScreeningResponse>>> getScreenings(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ScreeningResponse> screenings = adminScreeningService.getScreenings(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(screenings)));
    }

    /**
     * 상영 스케줄 상세 조회
     */
    @GetMapping("/{screeningId}")
    public ResponseEntity<ApiResponse<ScreeningResponse>> getScreening(@PathVariable Long screeningId) {
        ScreeningResponse screening = adminScreeningService.getScreening(screeningId);
        return ResponseEntity.ok(ApiResponse.success(screening));
    }

    /**
     * 특정 영화의 상영 스케줄 목록 조회
     */
    @GetMapping("/by-movie")
    public ResponseEntity<ApiResponse<List<ScreeningResponse>>> getScreeningsByMovie(
            @RequestParam Long movieId) {
        List<ScreeningResponse> screenings = adminScreeningService.getScreeningsByMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(screenings));
    }

    /**
     * 특정 상영관의 상영 스케줄 목록 조회
     */
    @GetMapping("/by-screen")
    public ResponseEntity<ApiResponse<List<ScreeningResponse>>> getScreeningsByScreen(
            @RequestParam Long screenId) {
        List<ScreeningResponse> screenings = adminScreeningService.getScreeningsByScreen(screenId);
        return ResponseEntity.ok(ApiResponse.success(screenings));
    }
}
