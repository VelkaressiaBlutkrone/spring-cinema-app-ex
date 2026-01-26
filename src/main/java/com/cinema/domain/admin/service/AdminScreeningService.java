package com.cinema.domain.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.ScreeningCreateRequest;
import com.cinema.domain.admin.dto.ScreeningResponse;
import com.cinema.domain.admin.dto.ScreeningUpdateRequest;
import com.cinema.domain.movie.entity.Movie;
import com.cinema.domain.movie.repository.MovieRepository;
import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.repository.ScreenRepository;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.ScreeningException;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 상영 스케줄 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminScreeningService {

    private final ScreeningRepository screeningRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;

    /**
     * 상영 스케줄 등록
     */
    @Transactional
    public Long createScreening(ScreeningCreateRequest request) {
        // 1. 영화 및 상영관 조회
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREEN_NOT_FOUND));

        // 2. 상영 종료 시간 계산 (영화 러닝타임 기준)
        java.time.LocalDateTime endTime = request.getStartTime().plusMinutes(movie.getRunningTime());

        // 3. 시간 중복 검증: 같은 상영관에서 시간이 겹치는 상영이 있는지 확인
        if (!screeningRepository.findOverlappingScreenings(
                request.getScreenId(), request.getStartTime(), endTime).isEmpty()) {
            throw ScreeningException.timeOverlap(request.getScreenId());
        }

        // 4. 저장
        Screening screening = Screening.builder()
                .movie(movie)
                .screen(screen)
                .startTime(request.getStartTime())
                .endTime(endTime)
                .build();

        return screeningRepository.save(screening).getId();
    }

    /**
     * 상영 스케줄 수정
     */
    @Transactional
    public void updateScreening(Long screeningId, ScreeningUpdateRequest request) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));

        // 영화 및 상영관 조회
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREEN_NOT_FOUND));

        // 상영 종료 시간 계산
        java.time.LocalDateTime endTime = request.getStartTime().plusMinutes(movie.getRunningTime());

        // 시간 중복 검증 (자기 자신 제외)
        List<Screening> overlappingScreenings = screeningRepository.findOverlappingScreenings(
                request.getScreenId(), request.getStartTime(), endTime);
        overlappingScreenings.removeIf(s -> s.getId().equals(screeningId));
        if (!overlappingScreenings.isEmpty()) {
            throw ScreeningException.timeOverlap(request.getScreenId());
        }

        // 상영 스케줄 정보 수정
        screening.updateInfo(movie, screen, request.getStartTime(), endTime);
    }

    /**
     * 상영 스케줄 삭제
     */
    @Transactional
    public void deleteScreening(Long screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));

        screeningRepository.delete(screening);
    }

    /**
     * 상영 스케줄 목록 조회 (페이징)
     */
    public Page<ScreeningResponse> getScreenings(Pageable pageable) {
        return screeningRepository.findAll(pageable)
                .map(ScreeningResponse::new);
    }

    /**
     * 상영 스케줄 상세 조회
     */
    public ScreeningResponse getScreening(Long screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));

        return new ScreeningResponse(screening);
    }

    /**
     * 특정 영화의 상영 스케줄 목록 조회
     */
    public List<ScreeningResponse> getScreeningsByMovie(Long movieId) {
        return screeningRepository.findByMovieId(movieId).stream()
                .map(ScreeningResponse::new)
                .toList();
    }

    /**
     * 특정 상영관의 상영 스케줄 목록 조회
     */
    public List<ScreeningResponse> getScreeningsByScreen(Long screenId) {
        return screeningRepository.findByScreenId(screenId).stream()
                .map(ScreeningResponse::new)
                .toList();
    }
}
