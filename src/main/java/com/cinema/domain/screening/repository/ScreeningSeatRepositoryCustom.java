package com.cinema.domain.screening.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.cinema.domain.screening.entity.ScreeningSeat;

/**
 * ScreeningSeat Repository Custom 인터페이스
 * QueryDSL을 사용하는 복잡한 쿼리 메서드 정의
 */
public interface ScreeningSeatRepositoryCustom {

    /**
     * HOLD 만료된 좌석 조회
     *
     * @param now 현재 시간
     * @return 만료된 HOLD 좌석 목록
     */
    List<ScreeningSeat> findExpiredHolds(LocalDateTime now);

    /**
     * HOLD 만료된 좌석 일괄 해제
     *
     * @param now 현재 시간
     * @return 해제된 좌석 수
     */
    int releaseExpiredHolds(LocalDateTime now);

    /**
     * 특정 회원의 HOLD 좌석 조회
     *
     * @param memberId 회원 ID
     * @return HOLD 좌석 목록
     */
    List<ScreeningSeat> findHoldsByMemberId(Long memberId);

    /**
     * 상영별 좌석 상태 통계
     *
     * @param screeningId 상영 ID
     * @return 상태별 좌석 수 (Object[]: [SeatStatus, Long count])
     */
    List<Object[]> countByScreeningIdGroupByStatus(Long screeningId);
}
