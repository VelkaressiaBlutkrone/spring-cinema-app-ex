package com.cinema.domain.screening.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningStatus;

/**
 * 상영 스케줄 Repository
 */
public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    List<Screening> findByMovieId(Long movieId);

    List<Screening> findByScreenId(Long screenId);

    List<Screening> findByStatus(ScreeningStatus status);

    /**
     * 특정 날짜의 상영 스케줄 조회
     */
    @Query("SELECT s FROM Screening s WHERE DATE(s.startTime) = DATE(:date) AND s.status = :status")
    List<Screening> findByDateAndStatus(@Param("date") LocalDateTime date, @Param("status") ScreeningStatus status);

    /**
     * 특정 영화의 특정 날짜 상영 스케줄 조회
     */
    @Query("SELECT s FROM Screening s WHERE s.movie.id = :movieId AND DATE(s.startTime) = DATE(:date) AND s.status = :status")
    List<Screening> findByMovieIdAndDateAndStatus(
            @Param("movieId") Long movieId,
            @Param("date") LocalDateTime date,
            @Param("status") ScreeningStatus status);

    /**
     * 상영과 관련된 좌석 정보를 함께 조회
     */
    @Query("SELECT s FROM Screening s " +
            "JOIN FETCH s.movie " +
            "JOIN FETCH s.screen " +
            "WHERE s.id = :id")
    Optional<Screening> findByIdWithMovieAndScreen(@Param("id") Long id);

    /**
     * 상영과 좌석 상태를 함께 조회
     */
    @Query("SELECT DISTINCT s FROM Screening s " +
            "LEFT JOIN FETCH s.screeningSeats ss " +
            "LEFT JOIN FETCH ss.seat " +
            "WHERE s.id = :id")
    Optional<Screening> findByIdWithScreeningSeats(@Param("id") Long id);

    /**
     * 같은 상영관에서 시간이 겹치는 상영 스케줄 조회
     * 시간 겹침 조건: 새 상영의 시작 시간 < 기존 상영의 종료 시간 AND 새 상영의 종료 시간 > 기존 상영의 시작 시간
     * 취소된 상영(CANCELLED)은 제외
     */
    @Query("SELECT s FROM Screening s " +
            "WHERE s.screen.id = :screenId " +
            "AND s.status != com.cinema.domain.screening.entity.ScreeningStatus.CANCELLED " +
            "AND s.startTime < :endTime " +
            "AND s.endTime > :startTime")
    List<Screening> findOverlappingScreenings(
            @Param("screenId") Long screenId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
