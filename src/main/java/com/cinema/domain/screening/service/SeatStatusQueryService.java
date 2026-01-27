package com.cinema.domain.screening.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.screening.dto.SeatLayoutResponse;
import com.cinema.domain.screening.dto.SeatStatusItem;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.infrastructure.redis.RedisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 좌석 배치/상태 조회 서비스 (Step 5)
 *
 * RULE:
 * - Key: seat:status:{screeningId}
 * - Redis 우선 조회, 장애 시 DB Fallback
 * - 쓰기(예매/HOLD 등)는 이 서비스가 아님 → 예매 차단은 SeatCommandService 등에서 Fail Fast
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeatStatusQueryService {

    private final RedisService redisService;
    private final ScreeningRepository screeningRepository;

    @Value("${seat.status.cache-ttl-minutes:5}")
    private long cacheTtlMinutes;

    /**
     * 상영별 좌석 배치·상태 조회
     * 1) Redis 캐시 조회 → 있으면 반환
     * 2) Redis 예외/미스 시 DB 조회 후 캐시 저장 후 반환
     */
    public SeatLayoutResponse getSeatLayout(Long screeningId) {
        Optional<SeatLayoutResponse> cached = getFromCache(screeningId);
        if (cached.isPresent()) {
            return cached.get();
        }
        return getFromDbAndCache(screeningId);
    }

    /**
     * Redis에서 좌석 상태 조회. 장애 시 empty 반환(DB Fallback 유도).
     */
    private Optional<SeatLayoutResponse> getFromCache(Long screeningId) {
        try {
            return redisService.getSeatStatus(screeningId, SeatLayoutResponse.class);
        } catch (Exception e) {
            log.warn("[Redis] 좌석 캐시 조회 실패, DB Fallback - screeningId={}, cause={}",
                    screeningId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * DB에서 좌석 정보 조회 후 Redis에 캐시하고 반환
     */
    private SeatLayoutResponse getFromDbAndCache(Long screeningId) {
        Screening screening = screeningRepository.findByIdWithScreeningSeats(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));

        List<SeatStatusItem> items = screening.getScreeningSeats().stream()
                .map(this::toSeatStatusItem)
                .toList();

        SeatLayoutResponse response = SeatLayoutResponse.builder()
                .screeningId(screeningId)
                .seats(items)
                .build();

        try {
            redisService.saveSeatStatus(screeningId, response, cacheTtlMinutes);
        } catch (Exception e) {
            log.warn("[Redis] 좌석 캐시 저장 실패(읽기는 유지) - screeningId={}, cause={}",
                    screeningId, e.getMessage());
        }

        return response;
    }

    private SeatStatusItem toSeatStatusItem(ScreeningSeat ss) {
        return SeatStatusItem.builder()
                .seatId(ss.getSeat().getId())
                .status(ss.getStatus())
                .rowLabel(ss.getSeat().getRowLabel())
                .seatNo(ss.getSeat().getSeatNo())
                .holdExpireAt(ss.getHoldExpireAt())
                .build();
    }

    /**
     * 좌석 상태 캐시 무효화.
     * 좌석 상태가 변경될 때(Step 6 HOLD/해제, Step 7 예매/취소 등) 호출.
     */
    public void invalidateSeatStatusCache(Long screeningId) {
        try {
            redisService.invalidateSeatStatus(screeningId);
        } catch (Exception e) {
            log.warn("[Redis] 좌석 캐시 무효화 실패 - screeningId={}, cause={}",
                    screeningId, e.getMessage());
        }
    }
}
