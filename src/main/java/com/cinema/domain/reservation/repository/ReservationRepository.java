package com.cinema.domain.reservation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationStatus;

/**
 * 예매 Repository
 */
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByReservationNo(String reservationNo);

    List<Reservation> findByMemberId(Long memberId);

    List<Reservation> findByMemberIdAndStatus(Long memberId, ReservationStatus status);

    List<Reservation> findByScreeningId(Long screeningId);

    /**
     * 예매 상세 조회 (좌석 정보 포함)
     */
    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.member " +
           "JOIN FETCH r.screening s " +
           "JOIN FETCH s.movie " +
           "LEFT JOIN FETCH r.reservationSeats rs " +
           "LEFT JOIN FETCH rs.seat " +
           "WHERE r.id = :id")
    Optional<Reservation> findByIdWithDetails(@Param("id") Long id);

    /**
     * 회원의 예매 목록 조회 (상세 정보 포함)
     */
    @Query("SELECT DISTINCT r FROM Reservation r " +
           "JOIN FETCH r.screening s " +
           "JOIN FETCH s.movie " +
           "WHERE r.member.id = :memberId " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findByMemberIdWithDetails(@Param("memberId") Long memberId);
}
