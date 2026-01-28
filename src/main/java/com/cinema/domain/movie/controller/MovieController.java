package com.cinema.domain.movie.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.admin.dto.MovieResponse;
import com.cinema.domain.admin.service.AdminMovieService;
import com.cinema.global.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 사용자용 영화 조회 API (공개)
 * SecurityConfig: GET /api/movies/** permitAll
 */
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final AdminMovieService adminMovieService;

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
