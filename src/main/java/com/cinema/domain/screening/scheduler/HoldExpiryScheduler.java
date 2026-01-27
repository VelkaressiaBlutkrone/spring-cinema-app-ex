package com.cinema.domain.screening.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;
import com.cinema.domain.screening.service.SeatStatusQueryService;
import com.cinema.infrastructure.redis.RedisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * HOLD 타임아웃 자동 해제 스케줄러 (Step 6)
 *
 * - 만료된 HOLD: DB releaseExpiredHolds, Redis deleteHold, 좌석 상태 캐시 무효화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HoldExpiryScheduler {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final RedisService redisService;
    private final SeatStatusQueryService seatStatusQueryService;

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

        var screeningIds = new java.util.HashSet<Long>();

        for (ScreeningSeat ss : expired) {
            Long screeningId = ss.getScreening().getId();
            Long seatId = ss.getSeat().getId();
            screeningIds.add(screeningId);
            try {
                redisService.deleteHold(screeningId, seatId);
            } catch (Exception e) {
                log.warn("[HoldExpiry] Redis deleteHold 실패 - screeningId={}, seatId={}, cause={}",
                        screeningId, seatId, e.getMessage());
            }
        }

        int count = screeningSeatRepository.releaseExpiredHolds(now);

        for (Long screeningId : screeningIds) {
            seatStatusQueryService.invalidateSeatStatusCache(screeningId);
        }

        log.info("[HoldExpiry] 만료 HOLD 해제 완료 - {}건", count);
    }
}
