package com.cinema.domain.reservation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.cinema.domain.member.entity.QMember;
import com.cinema.domain.movie.entity.QMovie;
import com.cinema.domain.reservation.entity.QReservation;
import com.cinema.domain.reservation.entity.QReservationSeat;
import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationStatus;
import com.cinema.domain.screening.entity.QScreening;
import com.cinema.domain.screening.entity.QSeat;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

/**
 * Reservation Repository Custom 구현체
 * QueryDSL을 사용하여 복잡한 쿼리 구현
 */
@Repository
@RequiredArgsConstructor
public class ReservationRepositoryImpl implements ReservationRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    // Q클래스 static final 선언
    private static final QReservation reservation = QReservation.reservation;
    private static final QMember member = QMember.member;
    private static final QScreening screening = QScreening.screening;
    private static final QMovie movie = QMovie.movie;
    private static final QReservationSeat reservationSeat = QReservationSeat.reservationSeat;
    private static final QSeat seat = QSeat.seat;

    @Override
    public Optional<Reservation> findByIdWithDetails(Long id) {
        Reservation result = queryFactory
                .selectFrom(reservation)
                .join(reservation.member, member).fetchJoin()
                .join(reservation.screening, screening).fetchJoin()
                .join(screening.movie, movie).fetchJoin()
                .leftJoin(reservation.reservationSeats, reservationSeat).fetchJoin()
                .leftJoin(reservationSeat.seat, seat).fetchJoin()
                .where(reservation.id.eq(id))
                .fetchOne();

        return Optional.ofNullable(result);
    }

    @Override
    public List<Reservation> findByMemberIdWithDetails(Long memberId) {
        return findByMemberIdWithDetails(memberId, null);
    }

    @Override
    public List<Reservation> findByMemberIdWithDetails(Long memberId, ReservationStatus status) {
        return queryFactory
                .selectFrom(reservation)
                .distinct()
                .join(reservation.screening, screening).fetchJoin()
                .join(screening.movie, movie).fetchJoin()
                .where(
                        reservation.member.id.eq(memberId),
                        statusEq(status))
                .orderBy(reservation.createdAt.desc())
                .fetch();
    }

    /**
     * 상태 조건 동적 처리
     */
    private BooleanExpression statusEq(ReservationStatus status) {
        return status != null ? reservation.status.eq(status) : null;
    }
}
