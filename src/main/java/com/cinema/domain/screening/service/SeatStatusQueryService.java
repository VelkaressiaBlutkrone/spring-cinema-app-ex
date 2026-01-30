package com.cinema.domain.screening.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.service.AdminScreeningService;
import com.cinema.domain.screening.entity.SeatStatus;
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
    private final AdminScreeningService adminScreeningService;

    @Value("${seat.status.cache-ttl-minutes:5}")
    private long cacheTtlMinutes;

    /**
     * 상영별 좌석 배치 및 상태를 조회한다.
     * 인증 사용자(memberId != null)인 경우, HOLD 좌석 중 현재 사용자 소유에 한해
     * holdToken, isHeldByCurrentUser를 후처리로 설정한다. (캐시는 비인증용 공통 유지)
     *
     * @param screeningId 상영ID
     * @param memberId    로그인 회원 ID (null이면 비인증, holdToken/isHeldByCurrentUser 미설정)
     * @return 좌석 레이아웃 및 상태 정보 DTO
     */
    public SeatLayoutResponse getSeatLayout(Long screeningId, Long memberId) {
        SeatLayoutResponse raw = getSeatLayoutInternal(screeningId);
        if (memberId == null) {
            return raw;
        }
        List<SeatStatusItem> enriched = raw.getSeats().stream()
                .map(item -> enrichWithMyHold(screeningId, item, memberId))
                .toList();
        return SeatLayoutResponse.builder()
                .screeningId(raw.getScreeningId())
                .seats(enriched)
                .build();
    }

    /**
     * 상영별 좌석 배치 및 상태를 조회한다. (비인증/공통 캐시용)
     */
    private SeatLayoutResponse getSeatLayoutInternal(Long screeningId) {
        Optional<SeatLayoutResponse> cached = getFromCache(screeningId);
        if (cached.isPresent()) {
            return cached.get();
        }
        return getFromDbAndCache(screeningId);
    }

    /**
     * Redis에서 좌석 상태를 조회한다.
     * - 정상적으로 조회되면 SeatLayoutResponse Optional로 반환
     * - 장애(예외) 발생 시 로그만 남기고 Optional.empty() 반환(DB Fallback 트리거)
     *
     * @param screeningId 상영ID
     * @return Optional<SeatLayoutResponse> (존재하지 않으면 empty)
     */
    private Optional<SeatLayoutResponse> getFromCache(Long screeningId) {
        try {
            // Redis에서 좌석 상태 조회 (Key: seat:status:{screeningId})
            return redisService.getSeatStatus(screeningId, SeatLayoutResponse.class);
        } catch (Exception e) {
            // Redis 장애 시 fallback 로그 기록, DB 조회 유도
            log.warn("[Redis] 좌석 캐시 조회 실패, DB Fallback - screeningId={}, cause={}",
                    screeningId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * DB에서 좌석(배치+상태) 전체 정보를 조회하여 Redis에 캐시한 뒤 반환.
     * - 캐시 TTL은 cacheTtlMinutes(@Value로 주입, 기본 5분) 적용
     * - Redis 저장 실패시에도 좌석 정보 조회 결과는 그대로 반환(읽기 일관성 우선)
     *
     * @param screeningId 상영ID
     * @return 조회된 좌석 배치+상태 DTO
     */
    private SeatLayoutResponse getFromDbAndCache(Long screeningId) {
        // 1. Screening/ScreeningSeat 엔티티를 일괄 조회 (좌석+상태)
        Screening screening = screeningRepository.findByIdWithScreeningSeats(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));

        // 1-1. ScreeningSeat이 없으면 해당 상영관 좌석으로 초기화 (과거 등록 상영 보정)
        if (screening.getScreeningSeats().isEmpty()) {
            adminScreeningService.ensureScreeningSeats(screeningId);
            screening = screeningRepository.findByIdWithScreeningSeats(screeningId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));
        }

        // 2. ScreeningSeat → SeatStatusItem DTO list 변환
        List<SeatStatusItem> items = screening.getScreeningSeats().stream()
                .map(this::toSeatStatusItem)
                .toList();

        // 3. 전체 좌석 레이아웃 응답 생성
        SeatLayoutResponse response = SeatLayoutResponse.builder()
                .screeningId(screeningId)
                .seats(items)
                .build();

        // 4. Redis에 TTL과 함께 캐싱(장애 발생시 로그만 남기고 반환 영향 없음)
        try {
            redisService.saveSeatStatus(screeningId, response, cacheTtlMinutes);
        } catch (Exception e) {
            log.warn("[Redis] 좌석 캐시 저장 실패(읽기는 유지) - screeningId={}, cause={}",
                    screeningId, e.getMessage());
        }

        // 5. 조회 결과 반환
        return response;
    }

    /**
     * ScreeningSeat Entity를 SeatStatusItem DTO로 변환한다.
     * 변환 필드:
     * - seatId: 좌석 ID
     * - status: 좌석 상태(HOLD, AVAILABLE, RESERVED 등)
     * - rowLabel: 좌석 행 라벨(A, B 등)
     * - seatNo: 좌석 번호(1, 2, 3, ...)
     * - holdExpireAt: HOLD인 경우 만료 시각(아니면 null)
     *
     * @param ss ScreeningSeat 엔티티
     * @return SeatStatusItem DTO
     */
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
     * 좌석 항목에 "현재 사용자 HOLD" 정보를 붙인 복사본을 반환한다.
     * HOLD가 아니면 holdToken/isHeldByCurrentUser null; HOLD이면 Redis에서 소유자 확인 후 설정.
     */
    private SeatStatusItem enrichWithMyHold(Long screeningId, SeatStatusItem item, Long memberId) {
        if (item.getStatus() != SeatStatus.HOLD) {
            return SeatStatusItem.builder()
                    .seatId(item.getSeatId())
                    .status(item.getStatus())
                    .rowLabel(item.getRowLabel())
                    .seatNo(item.getSeatNo())
                    .holdExpireAt(item.getHoldExpireAt())
                    .holdToken(null)
                    .isHeldByCurrentUser(false)
                    .build();
        }
        return redisService.getHold(screeningId, item.getSeatId())
                .filter(info -> memberId.equals(info.memberId()))
                .map(info -> SeatStatusItem.builder()
                        .seatId(item.getSeatId())
                        .status(item.getStatus())
                        .rowLabel(item.getRowLabel())
                        .seatNo(item.getSeatNo())
                        .holdExpireAt(item.getHoldExpireAt())
                        .holdToken(info.holdToken())
                        .isHeldByCurrentUser(true)
                        .build())
                .orElseGet(() -> SeatStatusItem.builder()
                        .seatId(item.getSeatId())
                        .status(item.getStatus())
                        .rowLabel(item.getRowLabel())
                        .seatNo(item.getSeatNo())
                        .holdExpireAt(item.getHoldExpireAt())
                        .holdToken(null)
                        .isHeldByCurrentUser(false)
                        .build());
    }

    /**
     * 좌석 상태 캐시를 무효화한다.
     * - 좌석의 상태(HOLD/예매/취소/해제 등)가 변경될 때 반드시 호출 필요.
     * (캐시 일관성/최신화 목적)
     * - 장애 발생시 log만 기록, 실제 무효화가 실패해도 예외를 전파하지 않음
     *
     * @param screeningId 상영ID
     */
    public void invalidateSeatStatusCache(Long screeningId) {
        try {
            // Redis에서 해당 상영의 seat:status 캐시 삭제
            redisService.invalidateSeatStatus(screeningId);
        } catch (Exception e) {
            log.warn("[Redis] 좌석 캐시 무효화 실패 - screeningId={}, cause={}",
                    screeningId, e.getMessage());
        }
    }
}
