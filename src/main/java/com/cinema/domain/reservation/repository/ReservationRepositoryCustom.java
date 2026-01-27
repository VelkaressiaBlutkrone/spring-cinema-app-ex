package com.cinema.domain.reservation.repository;

import java.util.List;
import java.util.Optional;

import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationStatus;

/**
 * Reservation Repository Custom 인터페이스
 * QueryDSL을 사용하는 복잡한 쿼리 메서드 정의
 */
public interface ReservationRepositoryCustom {

    /**
     * 예매 상세 조회 (좌석 정보 포함)
     *
     * @param id 예매 ID
     * @return 예매 정보 (Member, Screening, Movie, ReservationSeat, Seat 포함)
     */
    Optional<Reservation> findByIdWithDetails(Long id);

    /**
     * 회원의 예매 목록 조회 (상세 정보 포함)
     *
     * @param memberId 회원 ID
     * @return 예매 목록 (Screening, Movie 포함)
     */
    List<Reservation> findByMemberIdWithDetails(Long memberId);

    /**
     * 회원의 예매 목록 조회 (상세 정보 포함, 상태 필터링)
     *
     * @param memberId 회원 ID
     * @param status   예매 상태 (null이면 전체 조회)
     * @return 예매 목록 (Screening, Movie 포함)
     */
    List<Reservation> findByMemberIdWithDetails(Long memberId, ReservationStatus status);
}
