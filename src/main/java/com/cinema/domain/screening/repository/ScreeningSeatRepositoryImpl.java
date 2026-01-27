package com.cinema.domain.screening.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.screening.entity.QScreeningSeat;
import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.entity.SeatStatus;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

/**
 * ScreeningSeat Repository Custom 구현체
 * QueryDSL을 사용하여 복잡한 쿼리 구현
 */
@Repository
@RequiredArgsConstructor
public class ScreeningSeatRepositoryImpl implements ScreeningSeatRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    // Q클래스 static final 선언
    private static final QScreeningSeat screeningSeat = QScreeningSeat.screeningSeat;

    @Override
    public List<ScreeningSeat> findExpiredHolds(LocalDateTime now) {
        return queryFactory
                .selectFrom(screeningSeat)
                .where(
                        screeningSeat.status.eq(SeatStatus.HOLD),
                        screeningSeat.holdExpireAt.lt(now)
                )
                .fetch();
    }

    @Override
    @Transactional
    public int releaseExpiredHolds(LocalDateTime now) {
        return (int) queryFactory
                .update(screeningSeat)
                .set(screeningSeat.status, SeatStatus.AVAILABLE)
                .setNull(screeningSeat.holdToken)
                .setNull(screeningSeat.holdMember)
                .setNull(screeningSeat.holdExpireAt)
                .where(
                        screeningSeat.status.eq(SeatStatus.HOLD),
                        screeningSeat.holdExpireAt.lt(now)
                )
                .execute();
    }

    @Override
    public List<ScreeningSeat> findHoldsByMemberId(Long memberId) {
        return queryFactory
                .selectFrom(screeningSeat)
                .where(
                        screeningSeat.holdMember.id.eq(memberId),
                        screeningSeat.status.eq(SeatStatus.HOLD)
                )
                .fetch();
    }

    @Override
    public List<Object[]> countByScreeningIdGroupByStatus(Long screeningId) {
        List<Tuple> results = queryFactory
                .select(
                        screeningSeat.status,
                        screeningSeat.status.count()
                )
                .from(screeningSeat)
                .where(screeningSeat.screening.id.eq(screeningId))
                .groupBy(screeningSeat.status)
                .fetch();

        // Tuple을 Object[]로 변환
        return results.stream()
                .map(tuple -> new Object[]{
                        tuple.get(screeningSeat.status),
                        tuple.get(screeningSeat.status.count())
                })
                .toList();
    }
}
