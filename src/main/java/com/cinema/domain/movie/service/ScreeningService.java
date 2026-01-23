package com.cinema.domain.movie.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.movie.dto.ScreeningRequest;
import com.cinema.domain.movie.entity.Movie;
import com.cinema.domain.movie.repository.MovieRepository;
import com.cinema.domain.screen.entity.Screen;
import com.cinema.domain.screen.entity.Screening;
import com.cinema.domain.screen.repository.ScreenRepository;
import com.cinema.domain.screen.repository.ScreeningRepository;

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
                .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다."));
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new IllegalArgumentException("상영관을 찾을 수 없습니다."));

        // 2. 상영 종료 시간 계산 (영화 러닝타임 + 청소시간 10분 고려)
        java.time.LocalDateTime endTime = request.getStartTime().plusMinutes(movie.getRunningTime());

        // 3. 시간 중복 검증
        boolean isOverlapped = screeningRepository.existsByTimeOverlap(
                screen.getId(), request.getStartTime(), endTime);

        if (isOverlapped) {
            throw new IllegalArgumentException("해당 시간에 상영 일정이 이미 존재합니다.");
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
