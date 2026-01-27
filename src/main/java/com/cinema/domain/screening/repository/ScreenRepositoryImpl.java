package com.cinema.domain.screening.repository;

import org.springframework.stereotype.Repository;

import com.cinema.domain.screening.entity.QScreen;
import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.theater.entity.QTheater;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

/**
 * Screen Repository Custom 구현체
 * QueryDSL을 사용하여 복잡한 쿼리 구현
 */
@Repository
@RequiredArgsConstructor
public class ScreenRepositoryImpl implements ScreenRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    // Q클래스 static final 선언
    private static final QScreen screen = QScreen.screen;
    private static final QTheater theater = QTheater.theater;

    @Override
    public Screen findByIdWithTheater(Long id) {
        return queryFactory
                .selectFrom(screen)
                .join(screen.theater, theater).fetchJoin()
                .where(screen.id.eq(id))
                .fetchOne();
    }
}
