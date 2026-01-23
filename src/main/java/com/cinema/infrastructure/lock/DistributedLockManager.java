package com.cinema.infrastructure.lock;

import java.util.concurrent.TimeUnit;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 분산 락 관리자
 * 
 * RULE 4.3: 분산 락 규칙
 * - 락 키 규칙: lock:screening:{screeningId}:seat:{seatId}
 * - 락 획득 실패 시 즉시 실패 응답 (Fail Fast)
 * - 재시도 로직은 클라이언트 책임
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DistributedLockManager {

    private final RedissonClient redissonClient;

    private static final String LOCK_PREFIX = "lock:";
    private static final long DEFAULT_WAIT_TIME = 0L;  // 즉시 실패 (Fail Fast)
    private static final long DEFAULT_LEASE_TIME = 10L; // 락 보유 시간 (초)

    /**
     * 좌석 락 키 생성
     * 
     * @param screeningId 상영 ID
     * @param seatId 좌석 ID
     * @return 락 키
     */
    public String createSeatLockKey(Long screeningId, Long seatId) {
        return LOCK_PREFIX + "screening:" + screeningId + ":seat:" + seatId;
    }

    /**
     * 락 획득 시도 (Fail Fast)
     * 
     * @param lockKey 락 키
     * @param waitTime 대기 시간 (밀리초)
     * @param leaseTime 락 보유 시간 (밀리초)
     * @return 락 획득 성공 여부
     */
    public boolean tryLock(String lockKey, long waitTime, long leaseTime) {
        RLock lock = redissonClient.getLock(lockKey);
        try {
            boolean acquired = lock.tryLock(waitTime, leaseTime, TimeUnit.MILLISECONDS);
            if (acquired) {
                log.debug("[Lock] 락 획득 성공: {}", lockKey);
            } else {
                log.warn("[Lock] 락 획득 실패: {}", lockKey);
            }
            return acquired;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("[Lock] 락 획득 중 인터럽트: {}", lockKey, e);
            return false;
        }
    }

    /**
     * 락 획득 시도 (기본 설정)
     * 
     * @param lockKey 락 키
     * @return 락 획득 성공 여부
     */
    public boolean tryLock(String lockKey) {
        return tryLock(lockKey, DEFAULT_WAIT_TIME, DEFAULT_LEASE_TIME * 1000);
    }

    /**
     * 좌석 락 획득 시도
     * 
     * @param screeningId 상영 ID
     * @param seatId 좌석 ID
     * @return 락 획득 성공 여부
     */
    public boolean tryLockSeat(Long screeningId, Long seatId) {
        String lockKey = createSeatLockKey(screeningId, seatId);
        return tryLock(lockKey);
    }

    /**
     * 락 해제
     * 
     * @param lockKey 락 키
     */
    public void unlock(String lockKey) {
        RLock lock = redissonClient.getLock(lockKey);
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
            log.debug("[Lock] 락 해제: {}", lockKey);
        }
    }

    /**
     * 좌석 락 해제
     * 
     * @param screeningId 상영 ID
     * @param seatId 좌석 ID
     */
    public void unlockSeat(Long screeningId, Long seatId) {
        String lockKey = createSeatLockKey(screeningId, seatId);
        unlock(lockKey);
    }

    /**
     * 락을 사용하여 작업 실행
     * 
     * @param lockKey 락 키
     * @param action 실행할 작업
     * @param <T> 반환 타입
     * @return 작업 결과
     */
    public <T> T executeWithLock(String lockKey, LockAction<T> action) {
        if (!tryLock(lockKey)) {
            throw new LockAcquisitionException("락 획득 실패: " + lockKey);
        }
        try {
            return action.execute();
        } finally {
            unlock(lockKey);
        }
    }

    /**
     * 락 내 실행할 작업 인터페이스
     */
    @FunctionalInterface
    public interface LockAction<T> {
        T execute();
    }

    /**
     * 락 획득 실패 예외
     */
    public static class LockAcquisitionException extends RuntimeException {
        public LockAcquisitionException(String message) {
            super(message);
        }
    }
}
