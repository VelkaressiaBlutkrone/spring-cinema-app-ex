package com.cinema.domain.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.MovieCreateRequest;
import com.cinema.domain.admin.dto.MovieResponse;
import com.cinema.domain.admin.dto.MovieUpdateRequest;
import com.cinema.domain.movie.entity.Movie;
import com.cinema.domain.movie.repository.MovieRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 영화 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMovieService {

    private final MovieRepository movieRepository;

    /**
     * 영화 등록
     */
    @Transactional
    public Long createMovie(MovieCreateRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .runningTime(request.getRunningTime())
                .rating(request.getRating())
                .genre(request.getGenre())
                .director(request.getDirector())
                .actors(request.getActors())
                .posterUrl(request.getPosterUrl())
                .releaseDate(request.getReleaseDate())
                .build();

        return movieRepository.save(movie).getId();
    }

    /**
     * 영화 수정
     */
    @Transactional
    public void updateMovie(Long movieId, MovieUpdateRequest request) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));

        movie.updateInfo(
                request.getTitle(),
                request.getDescription(),
                request.getRunningTime(),
                request.getRating(),
                request.getGenre(),
                request.getDirector(),
                request.getActors(),
                request.getPosterUrl());
    }

    /**
     * 영화 삭제
     */
    @Transactional
    public void deleteMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));

        movieRepository.delete(movie);
    }

    /**
     * 영화 목록 조회 (페이징)
     */
    public Page<MovieResponse> getMovies(Pageable pageable) {
        return movieRepository.findAll(pageable)
                .map(MovieResponse::new);
    }

    /**
     * 영화 상세 조회
     */
    public MovieResponse getMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));

        return new MovieResponse(movie);
    }

    /**
     * 영화 목록 조회 (전체)
     */
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(MovieResponse::new)
                .collect(Collectors.toList());
    }
}
