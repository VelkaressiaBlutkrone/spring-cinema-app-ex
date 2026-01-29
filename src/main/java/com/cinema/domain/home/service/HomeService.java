package com.cinema.domain.home.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.home.dto.HomeStatsResponse;
import com.cinema.domain.home.dto.UpcomingMovieItem;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.repository.ScreenRepository;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.domain.theater.repository.TheaterRepository;

import lombok.RequiredArgsConstructor;

/**
 * 메인 화면용 홈 API 서비스 (Step 10)
 * - 영화관/상영관 현황 요약, 3일 이내 상영 예정 영화 목록
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private final TheaterRepository theaterRepository;
    private final ScreenRepository screenRepository;
    private final ScreeningRepository screeningRepository;

    /**
     * 영화관 수, 상영관 수, 오늘 상영 수
     */
    public HomeStatsResponse getStats() {
        long theaterCount = theaterRepository.count();
        long screenCount = screenRepository.count();
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = LocalDateTime.of(today, LocalTime.MIN);
        LocalDateTime todayEnd = todayStart.plusDays(1);
        List<Screening> todayScreenings = screeningRepository.findUpcomingScreenings(todayStart, todayEnd);
        long todayScreeningCount = todayScreenings.size();
        return new HomeStatsResponse(theaterCount, screenCount, todayScreeningCount);
    }

    /**
     * 현재 일자 기준 days일 이내 상영 예정 영화 목록 (중복 제거, movieId 기준)
     */
    public List<UpcomingMovieItem> getUpcomingMovies(int days) {
        LocalDateTime from = LocalDateTime.now();
        LocalDateTime to = from.plusDays(days);
        List<Screening> screenings = screeningRepository.findUpcomingScreenings(from, to);
        Map<Long, UpcomingMovieItem> byMovie = new LinkedHashMap<>();
        for (Screening s : screenings) {
            byMovie.putIfAbsent(
                    s.getMovie().getId(),
                    new UpcomingMovieItem(s.getMovie().getId(), s.getMovie().getTitle(), s.getMovie().getPosterUrl()));
        }
        return new ArrayList<>(byMovie.values());
    }
}
