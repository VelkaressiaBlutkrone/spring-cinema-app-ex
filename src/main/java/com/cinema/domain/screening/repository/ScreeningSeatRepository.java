package com.cinema.domain.screening.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.entity.SeatStatus;

/**
 * 상영별 좌석 상태 Repository
 */
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {

    List<ScreeningSeat> findByScreeningId(Long screeningId);

    List<ScreeningSeat> findByScreeningIdAndStatus(Long screeningId, SeatStatus status);

    Optional<ScreeningSeat> findByScreeningIdAndSeatId(Long screeningId, Long seatId);

    /**
     * HOLD 만료된 좌석 조회
     */
    @Query("SELECT ss FROM ScreeningSeat ss WHERE ss.status = 'HOLD' AND ss.holdExpireAt < :now")
    List<ScreeningSeat> findExpiredHolds(@Param("now") LocalDateTime now);

    /**
     * HOLD 만료된 좌석 일괄 해제
     */
    @Modifying
    @Query("UPDATE ScreeningSeat ss SET ss.status = 'AVAILABLE', " +
            "ss.holdToken = null, ss.holdMember = null, ss.holdExpireAt = null " +
            "WHERE ss.status = 'HOLD' AND ss.holdExpireAt < :now")
    int releaseExpiredHolds(@Param("now") LocalDateTime now);

    /**
     * 특정 회원의 HOLD 좌석 조회
     */
    @Query("SELECT ss FROM ScreeningSeat ss WHERE ss.holdMember.id = :memberId AND ss.status = 'HOLD'")
    List<ScreeningSeat> findHoldsByMemberId(@Param("memberId") Long memberId);

    /**
     * 상영별 좌석 상태 통계
     */
    @Query("SELECT ss.status, COUNT(ss) FROM ScreeningSeat ss WHERE ss.screening.id = :screeningId GROUP BY ss.status")
    List<Object[]> countByScreeningIdGroupByStatus(@Param("screeningId") Long screeningId);
}
