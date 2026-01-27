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
    /**
     * 좌석 HOLD 요청
     * - 분산 락(lock:screening:{screeningId}:seat:{seatId}) 을 통한 동시성 제어
     * - 락 획득에 실패하면 즉시 예외(SeatException.lockFailed) 반환
     * - 실제 HOLD 프로세스는 doHold()에서 처리
     * - 작업 이후 락 해제 보장
     */
    @Transactional
    public SeatHoldResponse hold(Long screeningId, Long seatId, Long memberId) {
        // 좌석 별 분산 락 획득 시도
        if (!lockManager.tryLockSeat(screeningId, seatId)) {
            // 락 획득 실패 시 예외 반환
            throw SeatException.lockFailed(screeningId, seatId);
        }
        try {
            // 실제 HOLD 처리
            return doHold(screeningId, seatId, memberId);
        } finally {
            // 락 해제
            lockManager.unlockSeat(screeningId, seatId);
        }
    }

    /**
     * 좌석 HOLD 실제 처리 메서드
     * 1. 사용자, 상영 정보 검증 및 정책 체크
     * 2. 이미 해당 사용자가 HOLD한 좌석 수 체크 (최대 보유 수 제한)
     * 3. 상영 정보 bookable 여부 검증
     * 4. 좌석 존재 및 상태 확인
     * 5. Redis에 HOLD 정보 저장(holdToken 생성), Entity에 HOLD 적용
     * 6. 만료 시간 및 TTL 계산, 반환 DTO 세팅
     * 7. 좌석 상태 캐시 무효화
     */
    private SeatHoldResponse doHold(Long screeningId, Long seatId, Long memberId) {
        // 1. 사용자 정보 조회 및 검증
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 2. 해당 사용자가 이미 HOLD한 좌석 수 체크 (정책 위반 시 예외)
        List<ScreeningSeat> memberHolds = screeningSeatRepository.findHoldsByMemberId(memberId);
        if (memberHolds.size() >= maxSeatsPerUser) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "사용자당 최대 " + maxSeatsPerUser + "석까지 HOLD 가능합니다.");
        }

        // 3. 상영 정보 존재 및 bookable 상태 확인
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));
        screening.validateBookable();

        // 4. 좌석 정보 존재 및 상태 확인
        ScreeningSeat screeningSeat = screeningSeatRepository.findByScreeningIdAndSeatId(screeningId, seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        // 5. Redis에 HOLD 정보 등록 및 holdToken 발급, Entity에도 HOLD 적용
        String holdToken = redisService.saveHold(screeningId, seatId, memberId, holdTtlMinutes);
        screeningSeat.hold(member, holdToken, holdTtlMinutes);

        // 6. 만료 시간 계산 및 TTL 계산
        LocalDateTime holdExpireAt = LocalDateTime.now().plusMinutes(holdTtlMinutes);

        // 7. 좌석 상태 캐시 무효화
        seatStatusQueryService.invalidateSeatStatusCache(screeningId);

        // 8. TTL 값 Redis에서 재조회 (예외적 상황 시 직접 계산)
        Long ttlSeconds = redisService.getHoldTtl(screeningId, seatId);
        if (ttlSeconds == null || ttlSeconds < 0) {
            ttlSeconds = (long) holdTtlMinutes * 60;
        }

        // 9. HOLD 응답 DTO 반환
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
     * - 분산 락 획득(실패시 즉시 에러)
     * - holdToken 검증
     * - DB 및 Redis에서 HOLD 해제 처리
     * - 캐시 무효화
     */
    @Transactional
    public void releaseHold(Long screeningId, Long seatId, String holdToken) {
        // 좌석 별 분산 락 획득
        if (!lockManager.tryLockSeat(screeningId, seatId)) {
            // 락 획득 실패 시 예외 반환
            throw SeatException.lockFailed(screeningId, seatId);
        }
        try {
            // 실제 해제 처리
            doReleaseHold(screeningId, seatId, holdToken);
        } finally {
            // 락 해제
            lockManager.unlockSeat(screeningId, seatId);
        }
    }

    /**
     * 좌석 HOLD 해제 비즈니스 로직
     * 1. Redis 내 holdToken 유효성 검증
     * 2. 좌석 Entity 내 holdToken 검증 및 상태 해제
     * 3. Redis에서 HOLD 정보 삭제
     * 4. 캐시 무효화
     */
    private void doReleaseHold(Long screeningId, Long seatId, String holdToken) {
        // 1. Redis의 holdToken 검증(불일치 또는 만료 시 예외)
        if (!redisService.validateHoldToken(screeningId, seatId, holdToken)) {
            throw SeatException.invalidHoldToken(screeningId, seatId);
        }

        // 2. 좌석 Entity 확인 및 holdToken 검증 후 해제
        ScreeningSeat screeningSeat = screeningSeatRepository.findByScreeningIdAndSeatId(screeningId, seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        screeningSeat.validateHoldTokenOrThrow(holdToken);
        screeningSeat.releaseHold();

        // 3. Redis에서 HOLD 정보 삭제
        redisService.deleteHold(screeningId, seatId);

        // 4. 좌석 상태 캐시 무효화
        seatStatusQueryService.invalidateSeatStatusCache(screeningId);
    }
}
