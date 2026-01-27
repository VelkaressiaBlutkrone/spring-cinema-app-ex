package com.cinema.domain.screening.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.entity.SeatStatus;

/**
 * 상영별 좌석 상태 Repository
 * 
 * RULE 2.3: QueryDSL 우선 사용 원칙
 * - 단순 조회는 Spring Data JPA 메서드 사용
 * - 집계 쿼리나 복잡한 쿼리는 QueryDSL 사용 (ScreeningSeatRepositoryCustom)
 */
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long>, ScreeningSeatRepositoryCustom {

    // ========================================
    // 단순 조회 (Spring Data JPA 메서드)
    // ========================================

    List<ScreeningSeat> findByScreeningId(Long screeningId);

    List<ScreeningSeat> findByScreeningIdAndStatus(Long screeningId, SeatStatus status);

    Optional<ScreeningSeat> findByScreeningIdAndSeatId(Long screeningId, Long seatId);

    // ========================================
    // 복잡한 쿼리 (QueryDSL 사용)
    // ScreeningSeatRepositoryCustom 인터페이스 참조
    // ========================================
    // - findExpiredHolds(LocalDateTime now)
    // - releaseExpiredHolds(LocalDateTime now)
    // - findHoldsByMemberId(Long memberId)
    // - countByScreeningIdGroupByStatus(Long screeningId)
}
