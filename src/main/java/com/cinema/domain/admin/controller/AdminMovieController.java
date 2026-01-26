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

import com.cinema.domain.admin.dto.MovieCreateRequest;
import com.cinema.domain.admin.dto.MovieResponse;
import com.cinema.domain.admin.dto.MovieUpdateRequest;
import com.cinema.domain.admin.service.AdminMovieService;
import com.cinema.global.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 영화 관리 컨트롤러
 *
 * RULE:
 * - /api/admin/** 경로는 ADMIN Role 기반 접근 필수
 */
@RestController
@RequestMapping("/api/admin/movies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMovieController {

    private final AdminMovieService adminMovieService;

    /**
     * 영화 등록
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createMovie(
            @Validated @RequestBody MovieCreateRequest request) {
        Long movieId = adminMovieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(movieId));
    }

    /**
     * 영화 수정
     */
    @PutMapping("/{movieId}")
    public ResponseEntity<ApiResponse<Void>> updateMovie(
            @PathVariable Long movieId,
            @Validated @RequestBody MovieUpdateRequest request) {
        adminMovieService.updateMovie(movieId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 영화 삭제
     */
    @DeleteMapping("/{movieId}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long movieId) {
        adminMovieService.deleteMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 영화 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MovieResponse>>> getMovies(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<MovieResponse> movies = adminMovieService.getMovies(pageable);
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    /**
     * 영화 상세 조회
     */
    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovie(@PathVariable Long movieId) {
        MovieResponse movie = adminMovieService.getMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(movie));
    }
}
