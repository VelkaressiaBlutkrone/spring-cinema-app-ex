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

import com.cinema.domain.admin.dto.ScreenCreateRequest;
import com.cinema.domain.admin.dto.ScreenResponse;
import com.cinema.domain.admin.dto.ScreenUpdateRequest;
import com.cinema.domain.admin.service.AdminScreenService;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.dto.PageResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 상영관 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/screens")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminScreenController {

    private final AdminScreenService adminScreenService;

    /**
     * 상영관 등록
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createScreen(
            @Validated @RequestBody ScreenCreateRequest request) {
        Long screenId = adminScreenService.createScreen(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(screenId));
    }

    /**
     * 상영관 수정
     */
    @PutMapping("/{screenId}")
    public ResponseEntity<ApiResponse<Void>> updateScreen(
            @PathVariable("screenId") Long screenId,
            @Validated @RequestBody ScreenUpdateRequest request) {
        adminScreenService.updateScreen(screenId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 상영관 삭제
     */
    @DeleteMapping("/{screenId}")
    public ResponseEntity<ApiResponse<Void>> deleteScreen(@PathVariable("screenId") Long screenId) {
        adminScreenService.deleteScreen(screenId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 상영관 목록 조회 (페이징)
     * Page 대신 PageResponse 사용 (Gson이 PageImpl을 올바르게 직렬화하지 못하는 문제 회피)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ScreenResponse>>> getScreens(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ScreenResponse> screens = adminScreenService.getScreens(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(screens)));
    }

    /**
     * 상영관 상세 조회
     */
    @GetMapping("/{screenId}")
    public ResponseEntity<ApiResponse<ScreenResponse>> getScreen(@PathVariable("screenId") Long screenId) {
        ScreenResponse screen = adminScreenService.getScreen(screenId);
        return ResponseEntity.ok(ApiResponse.success(screen));
    }

    /**
     * 특정 영화관의 상영관 목록 조회
     */
    @GetMapping("/by-theater")
    public ResponseEntity<ApiResponse<List<ScreenResponse>>> getScreensByTheater(
            @RequestParam("theaterId") Long theaterId) {
        List<ScreenResponse> screens = adminScreenService.getScreensByTheater(theaterId);
        return ResponseEntity.ok(ApiResponse.success(screens));
    }
}
