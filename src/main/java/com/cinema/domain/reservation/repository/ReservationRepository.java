package com.cinema.domain.reservation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationStatus;

/**
 * 예매 Repository
 *
 * RULE 2.3: QueryDSL 우선 사용 원칙
 * - 단순 조회는 Spring Data JPA 메서드 사용
 * - 다수 조인이 필요한 쿼리는 QueryDSL 사용 (ReservationRepositoryCustom)
 */
public interface ReservationRepository extends JpaRepository<Reservation, Long>, ReservationRepositoryCustom {

    // ========================================
    // 단순 조회 (Spring Data JPA 메서드)
    // ========================================

    Optional<Reservation> findByReservationNo(String reservationNo);

    List<Reservation> findByMemberId(Long memberId);

    List<Reservation> findByMemberIdAndStatus(Long memberId, ReservationStatus status);

    List<Reservation> findByScreeningId(Long screeningId);

    // ========================================
    // 복잡한 쿼리 (QueryDSL 사용)
    // ReservationRepositoryCustom 인터페이스 참조
    // ========================================
    // - findByIdWithDetails(Long id)
    // - findByMemberIdWithDetails(Long memberId)
    // - findByMemberIdWithDetails(Long memberId, ReservationStatus status)
}
