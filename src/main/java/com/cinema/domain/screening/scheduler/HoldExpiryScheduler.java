package com.cinema.domain.screening.scheduler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;
import com.cinema.domain.screening.service.SeatEventPublisher;
import com.cinema.domain.screening.service.SeatStatusQueryService;
import com.cinema.infrastructure.redis.RedisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * HOLD 타임아웃 자동 해제 스케줄러 (Step 6)
 *
 * - 만료된 HOLD: DB releaseExpiredHolds, Redis deleteHold, 좌석 상태 캐시 무효화
 * - Step 8: 만료 해제 시 실시간 좌석 이벤트 발행 (변경 좌석 ID만 Push)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HoldExpiryScheduler {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final RedisService redisService;
    private final SeatStatusQueryService seatStatusQueryService;
    private final SeatEventPublisher seatEventPublisher;

    /**
     * 1분마다 만료된 HOLD 자동 해제
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 60_000)
    @Transactional
    public void releaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();

        List<ScreeningSeat> expired = screeningSeatRepository.findExpiredHolds(now);

        if (expired.isEmpty()) {
            return;
        }

        Map<Long, List<Long>> screeningToSeatIds = new HashMap<>();

        for (ScreeningSeat ss : expired) {
            Long screeningId = ss.getScreening().getId();
            Long seatId = ss.getSeat().getId();
            screeningToSeatIds.computeIfAbsent(screeningId, k -> new ArrayList<>()).add(seatId);
            try {
                redisService.deleteHold(screeningId, seatId);
            } catch (Exception e) {
                log.warn("[HoldExpiry] Redis deleteHold 실패 - screeningId={}, seatId={}, cause={}",
                        screeningId, seatId, e.getMessage());
            }
        }

        int count = screeningSeatRepository.releaseExpiredHolds(now);

        for (Map.Entry<Long, List<Long>> e : screeningToSeatIds.entrySet()) {
            Long screeningId = e.getKey();
            List<Long> seatIds = e.getValue();
            seatStatusQueryService.invalidateSeatStatusCache(screeningId);
            seatEventPublisher.publishSeatStatusChanged(screeningId, seatIds);
        }

        log.info("[HoldExpiry] 만료 HOLD 해제 완료 - {}건", count);
    }
}
