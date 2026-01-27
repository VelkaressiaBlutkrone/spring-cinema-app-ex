package com.cinema.domain.screening.repository;

import com.cinema.domain.screening.entity.Screen;

/**
 * Screen Repository Custom 인터페이스
 * QueryDSL을 사용하는 복잡한 쿼리 메서드 정의
 */
public interface ScreenRepositoryCustom {

    /**
     * 상영관과 영화관 정보를 함께 조회
     *
     * @param id 상영관 ID
     * @return 상영관 정보 (Theater 포함)
     */
    Screen findByIdWithTheater(Long id);
}
