package com.cinema.domain.screening.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningStatus;

/**
 * Screening Repository Custom 인터페이스
 * QueryDSL을 사용하는 복잡한 쿼리 메서드 정의
 */
public interface ScreeningRepositoryCustom {

    /**
     * 특정 날짜의 상영 스케줄 조회
     *
     * @param date   날짜
     * @param status 상영 상태
     * @return 상영 스케줄 목록
     */
    List<Screening> findByDateAndStatus(LocalDateTime date, ScreeningStatus status);

    /**
     * 특정 영화의 특정 날짜 상영 스케줄 조회
     *
     * @param movieId 영화 ID
     * @param date    날짜
     * @param status  상영 상태
     * @return 상영 스케줄 목록
     */
    List<Screening> findByMovieIdAndDateAndStatus(Long movieId, LocalDateTime date, ScreeningStatus status);

    /**
     * 상영과 관련된 좌석 정보를 함께 조회
     *
     * @param id 상영 ID
     * @return 상영 정보 (Movie, Screen 포함)
     */
    Optional<Screening> findByIdWithMovieAndScreen(Long id);

    /**
     * 상영과 좌석 상태를 함께 조회
     *
     * @param id 상영 ID
     * @return 상영 정보 (ScreeningSeat, Seat 포함)
     */
    Optional<Screening> findByIdWithScreeningSeats(Long id);

    /**
     * 같은 상영관에서 시간이 겹치는 상영 스케줄 조회
     * 시간 겹침 조건: 새 상영의 시작 시간 < 기존 상영의 종료 시간 AND 새 상영의 종료 시간 > 기존 상영의 시작 시간
     * 취소된 상영(CANCELLED)은 제외
     *
     * @param screenId  상영관 ID
     * @param startTime 시작 시간
     * @param endTime   종료 시간
     * @return 겹치는 상영 스케줄 목록
     */
    List<Screening> findOverlappingScreenings(Long screenId, LocalDateTime startTime, LocalDateTime endTime);
}
