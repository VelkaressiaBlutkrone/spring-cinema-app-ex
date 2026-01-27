package com.cinema.domain.screening.service;

import java.util.List;

/**
 * 좌석 상태 변경 시 실시간 이벤트 발행 (Step 8)
 *
 * RULE:
 * - 좌석 상태 변경 시에만 Push
 * - 변경 좌석 ID만 전달 (전체 좌석 재전송 금지)
 * - 이벤트 ID 기반 멱등성 보장
 */
public interface SeatEventPublisher {

    /**
     * 해당 상영의 구독자에게 좌석 상태 변경 이벤트 전송
     *
     * @param screeningId 상영 ID
     * @param seatIds     변경된 좌석 ID 목록 (비어 있으면 전송하지 않음)
     */
    void publishSeatStatusChanged(Long screeningId, List<Long> seatIds);
}
