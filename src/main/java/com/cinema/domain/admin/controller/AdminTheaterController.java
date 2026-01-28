package com.cinema.domain.admin.controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.admin.dto.TheaterCreateRequest;
import com.cinema.domain.admin.dto.TheaterResponse;
import com.cinema.domain.admin.dto.TheaterUpdateRequest;
import com.cinema.domain.admin.service.AdminTheaterService;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.dto.PageResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 영화관 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/theaters")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTheaterController {

    private final AdminTheaterService adminTheaterService;

    /**
     * 영화관 등록
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createTheater(
            @Validated @RequestBody TheaterCreateRequest request) {
        Long theaterId = adminTheaterService.createTheater(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(theaterId));
    }

    /**
     * 영화관 수정
     */
    @PutMapping("/{theaterId}")
    public ResponseEntity<ApiResponse<Void>> updateTheater(
            @PathVariable("theaterId") Long theaterId,
            @Validated @RequestBody TheaterUpdateRequest request) {
        adminTheaterService.updateTheater(theaterId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 영화관 삭제
     */
    @DeleteMapping("/{theaterId}")
    public ResponseEntity<ApiResponse<Void>> deleteTheater(@PathVariable("theaterId") Long theaterId) {
        adminTheaterService.deleteTheater(theaterId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 영화관 목록 조회 (페이징)
     * Page 대신 PageResponse 사용 (Gson이 PageImpl을 올바르게 직렬화하지 못하는 문제 회피)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TheaterResponse>>> getTheaters(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TheaterResponse> theaters = adminTheaterService.getTheaters(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(theaters)));
    }

    /**
     * 영화관 상세 조회
     */
    @GetMapping("/{theaterId}")
    public ResponseEntity<ApiResponse<TheaterResponse>> getTheater(@PathVariable("theaterId") Long theaterId) {
        TheaterResponse theater = adminTheaterService.getTheater(theaterId);
        return ResponseEntity.ok(ApiResponse.success(theater));
    }
}
