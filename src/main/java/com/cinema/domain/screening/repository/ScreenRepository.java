package com.cinema.domain.screening.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.entity.ScreenStatus;

/**
 * 상영관 Repository
 *
 * RULE 2.3: QueryDSL 우선 사용 원칙
 * - 단순 조회는 Spring Data JPA 메서드 사용
 * - 조인이 필요한 쿼리는 QueryDSL 사용 (ScreenRepositoryCustom)
 */
public interface ScreenRepository extends JpaRepository<Screen, Long>, ScreenRepositoryCustom {

    // ========================================
    // 단순 조회 (Spring Data JPA 메서드)
    // ========================================

    List<Screen> findByTheaterId(Long theaterId);

    List<Screen> findByTheaterIdAndStatus(Long theaterId, ScreenStatus status);

    // ========================================
    // 복잡한 쿼리 (QueryDSL 사용)
    // ScreenRepositoryCustom 인터페이스 참조
    // ========================================
    // - findByIdWithTheater(Long id)
}
