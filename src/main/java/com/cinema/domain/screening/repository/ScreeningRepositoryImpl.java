package com.cinema.domain.screening.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.cinema.domain.movie.entity.QMovie;
import com.cinema.domain.screening.entity.QScreen;
import com.cinema.domain.screening.entity.QScreening;
import com.cinema.domain.screening.entity.QScreeningSeat;
import com.cinema.domain.screening.entity.QSeat;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningStatus;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

/**
 * Screening Repository Custom 구현체
 * QueryDSL을 사용하여 복잡한 쿼리 구현
 */
@Repository
@RequiredArgsConstructor
public class ScreeningRepositoryImpl implements ScreeningRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    // Q클래스 static final 선언
    private static final QScreening screening = QScreening.screening;
    private static final QMovie movie = QMovie.movie;
    private static final QScreen screen = QScreen.screen;
    private static final QScreeningSeat screeningSeat = QScreeningSeat.screeningSeat;
    private static final QSeat seat = QSeat.seat;

    @Override
    public List<Screening> findByDateAndStatus(LocalDateTime date, ScreeningStatus status) {
        LocalDate targetDate = date.toLocalDate();
        
        return queryFactory
                .selectFrom(screening)
                .where(
                        screening.startTime.date().eq(targetDate),
                        screening.status.eq(status)
                )
                .fetch();
    }

    @Override
    public List<Screening> findByMovieIdAndDateAndStatus(Long movieId, LocalDateTime date, ScreeningStatus status) {
        LocalDate targetDate = date.toLocalDate();
        
        return queryFactory
                .selectFrom(screening)
                .where(
                        screening.movie.id.eq(movieId),
                        screening.startTime.date().eq(targetDate),
                        screening.status.eq(status)
                )
                .fetch();
    }

    @Override
    public Optional<Screening> findByIdWithMovieAndScreen(Long id) {
        Screening result = queryFactory
                .selectFrom(screening)
                .join(screening.movie, movie).fetchJoin()
                .join(screening.screen, screen).fetchJoin()
                .where(screening.id.eq(id))
                .fetchOne();

        return Optional.ofNullable(result);
    }

    @Override
    public Optional<Screening> findByIdWithScreeningSeats(Long id) {
        Screening result = queryFactory
                .selectFrom(screening)
                .distinct()
                .leftJoin(screening.screeningSeats, screeningSeat).fetchJoin()
                .leftJoin(screeningSeat.seat, seat).fetchJoin()
                .where(screening.id.eq(id))
                .fetchOne();

        return Optional.ofNullable(result);
    }

    @Override
    public List<Screening> findOverlappingScreenings(Long screenId, LocalDateTime startTime, LocalDateTime endTime) {
        return queryFactory
                .selectFrom(screening)
                .where(
                        screening.screen.id.eq(screenId),
                        screening.status.ne(ScreeningStatus.CANCELLED),
                        screening.startTime.lt(endTime),
                        screening.endTime.gt(startTime)
                )
                .fetch();
    }
}
