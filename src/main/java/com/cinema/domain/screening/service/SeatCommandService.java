package com.cinema.domain.screening.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.domain.screening.dto.SeatHoldResponse;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.SeatException;
import com.cinema.infrastructure.lock.DistributedLockManager;
import com.cinema.infrastructure.redis.RedisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 좌석 상태 변경 단일 진입점 (Step 6)
 *
 * RULE 1.1: 좌석 상태 변경은 SeatCommandService를 통해서만 허용
 * - HOLD / 해제 / 결제 진행 / 예매 확정 등 모든 좌석 상태 변경은 이 서비스를 통해서만 수행
 * - 분산 락: lock:screening:{screeningId}:seat:{seatId}
 * - Redis HOLD Key: seat:hold:{screeningId}:{seatId}, TTL 설정 필수
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeatCommandService {

    private final DistributedLockManager lockManager;
    private final RedisService redisService;
    private final ScreeningRepository screeningRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final MemberRepository memberRepository;
    private final SeatStatusQueryService seatStatusQueryService;

    @Value("${seat.hold.ttl-minutes:7}")
    private int holdTtlMinutes;

    @Value("${seat.hold.max-seats-per-user:4}")
    private int maxSeatsPerUser;

    /**
     * 좌석 HOLD
     * 락 획득 실패 시 즉시 실패 응답 (Fail Fast)
     */
    @Transactional
    public SeatHoldResponse hold(Long screeningId, Long seatId, Long memberId) {
        if (!lockManager.tryLockSeat(screeningId, seatId)) {
            throw SeatException.lockFailed(screeningId, seatId);
        }
        try {
            return doHold(screeningId, seatId, memberId);
        } finally {
            lockManager.unlockSeat(screeningId, seatId);
        }
    }

    private SeatHoldResponse doHold(Long screeningId, Long seatId, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        List<ScreeningSeat> memberHolds = screeningSeatRepository.findHoldsByMemberId(memberId);
        if (memberHolds.size() >= maxSeatsPerUser) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "사용자당 최대 " + maxSeatsPerUser + "석까지 HOLD 가능합니다.");
        }

        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));
        screening.validateBookable();

        ScreeningSeat screeningSeat = screeningSeatRepository.findByScreeningIdAndSeatId(screeningId, seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        String holdToken = redisService.saveHold(screeningId, seatId, memberId, holdTtlMinutes);
        screeningSeat.hold(member, holdToken, holdTtlMinutes);

        LocalDateTime holdExpireAt = LocalDateTime.now().plusMinutes(holdTtlMinutes);
        seatStatusQueryService.invalidateSeatStatusCache(screeningId);

        Long ttlSeconds = redisService.getHoldTtl(screeningId, seatId);
        if (ttlSeconds == null || ttlSeconds < 0) {
            ttlSeconds = (long) holdTtlMinutes * 60;
        }

        return SeatHoldResponse.builder()
                .holdToken(holdToken)
                .screeningId(screeningId)
                .seatId(seatId)
                .holdExpireAt(holdExpireAt)
                .ttlSeconds(ttlSeconds)
                .build();
    }

    /**
     * 좌석 HOLD 해제
     * holdToken 검증 후 해제, 락 획득 실패 시 즉시 실패
     */
    @Transactional
    public void releaseHold(Long screeningId, Long seatId, String holdToken) {
        if (!lockManager.tryLockSeat(screeningId, seatId)) {
            throw SeatException.lockFailed(screeningId, seatId);
        }
        try {
            doReleaseHold(screeningId, seatId, holdToken);
        } finally {
            lockManager.unlockSeat(screeningId, seatId);
        }
    }

    private void doReleaseHold(Long screeningId, Long seatId, String holdToken) {
        if (!redisService.validateHoldToken(screeningId, seatId, holdToken)) {
            throw SeatException.invalidHoldToken(screeningId, seatId);
        }

        ScreeningSeat screeningSeat = screeningSeatRepository.findByScreeningIdAndSeatId(screeningId, seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        screeningSeat.validateHoldTokenOrThrow(holdToken);
        screeningSeat.releaseHold();

        redisService.deleteHold(screeningId, seatId);
        seatStatusQueryService.invalidateSeatStatusCache(screeningId);
    }
}
