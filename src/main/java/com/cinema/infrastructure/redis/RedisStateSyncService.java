package com.cinema.infrastructure.redis;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.screening.entity.SeatStatus;
import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis ↔ DB 상태 동기화 (Step 18)
 *
 * Redis 복구 시 DB의 HOLD 상태를 Redis에 반영
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStateSyncService {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final RedisService redisService;

    @Value("${seat.hold.ttl-minutes:7}")
    private int holdTtlMinutes;

    /**
     * DB의 HOLD 좌석 목록을 Redis에 동기화
     * - holdToken, holdMemberId, holdExpireAt이 있는 HOLD만 대상
     */
    @Transactional(readOnly = true)
    public void syncHoldsFromDbToRedis() {
        if (!redisService.isAvailable()) {
            log.warn("[Redis Sync] Redis 미사용 상태 - 동기화 스킵");
            return;
        }

        List<ScreeningSeat> allHolds = screeningSeatRepository.findByStatus(SeatStatus.HOLD)
                .stream()
                .filter(ss -> ss.getHoldToken() != null && ss.getHoldMember() != null)
                .filter(ss -> ss.getHoldExpireAt() != null && ss.getHoldExpireAt().isAfter(LocalDateTime.now()))
                .toList();

        int synced = 0;
        for (ScreeningSeat ss : allHolds) {
            try {
                Long screeningId = ss.getScreening().getId();
                Long seatId = ss.getSeat().getId();
                Long memberId = ss.getHoldMember().getId();
                long ttlMinutes = Math.max(1,
                        Duration.between(LocalDateTime.now(), ss.getHoldExpireAt()).toMinutes());
                redisService.saveHoldInternal(screeningId, seatId, memberId, ss.getHoldToken(), ttlMinutes);
                synced++;
            } catch (Exception e) {
                log.warn("[Redis Sync] HOLD 동기화 실패 - screeningSeatId={}: {}",
                        ss.getId(), e.getMessage());
            }
        }
        if (synced > 0) {
            log.info("[Redis Sync] DB HOLD → Redis 동기화 완료: {}건", synced);
        }
    }
}
