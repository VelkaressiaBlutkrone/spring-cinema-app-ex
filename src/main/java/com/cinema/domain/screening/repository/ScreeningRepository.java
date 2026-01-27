package com.cinema.domain.screening.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningStatus;

/**
 * 상영 스케줄 Repository
 *
 * RULE 2.3: QueryDSL 우선 사용 원칙
 * - 단순 조회는 Spring Data JPA 메서드 사용
 * - 다수 조인이 필요한 쿼리는 QueryDSL 사용 (ScreeningRepositoryCustom)
 */
public interface ScreeningRepository extends JpaRepository<Screening, Long>, ScreeningRepositoryCustom {

    // ========================================
    // 단순 조회 (Spring Data JPA 메서드)
    // ========================================

    List<Screening> findByMovieId(Long movieId);

    List<Screening> findByScreenId(Long screenId);

    List<Screening> findByStatus(ScreeningStatus status);

    // ========================================
    // 복잡한 쿼리 (QueryDSL 사용)
    // ScreeningRepositoryCustom 인터페이스 참조
    // ========================================
    // - findByDateAndStatus(LocalDateTime date, ScreeningStatus status)
    // - findByMovieIdAndDateAndStatus(Long movieId, LocalDateTime date,
    // ScreeningStatus status)
    // - findByIdWithMovieAndScreen(Long id)
    // - findByIdWithScreeningSeats(Long id)
    // - findOverlappingScreenings(Long screenId, LocalDateTime startTime,
    // LocalDateTime endTime)
}
