package com.cinema.domain.movie.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.movie.dto.ScreeningRequest;
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

@Service
@RequiredArgsConstructor
public class ScreeningService {

    private final ScreeningRepository screeningRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;

    @Transactional
    public Long createScreening(ScreeningRequest request) {
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
}
