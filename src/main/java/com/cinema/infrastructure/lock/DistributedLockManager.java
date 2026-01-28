package com.cinema.infrastructure.lock;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/**
 * 분산 락 관리자
 *
 * RULE 4.3: 분산 락 규칙
 * - 락 키 규칙: lock:screening:{screeningId}:seat:{seatId}
 * - 락 획득 실패 시 즉시 실패 응답 (Fail Fast)
 * - 재시도 로직은 클라이언트 책임
 * - Redis 미연결 시 락 획득 실패 처리 (서버는 계속 실행)
 */
@Slf4j
@Component
public class DistributedLockManager {

    /** RedissonClient (Redis 연결 실패 시 null일 수 있음) */
    private final RedissonClient redissonClient;

    /** Redis 미연결 시 로컬(인메모리) 락 폴백 */
    private final ConcurrentHashMap<String, ReentrantLock> localLocks = new ConcurrentHashMap<>();

    private static final String LOCK_PREFIX = "lock:";
    private static final long DEFAULT_WAIT_TIME = 0L; // 즉시 실패 (Fail Fast)
    private static final long DEFAULT_LEASE_TIME = 10L; // 락 보유 시간 (초)

    public DistributedLockManager(ObjectProvider<RedissonClient> redissonClientProvider) {
        this.redissonClient = redissonClientProvider.getIfAvailable();
        if (redissonClient == null) {
            log.warn("[Lock] RedissonClient가 null입니다. 분산 락 기능이 비활성화됩니다.");
        }
    }

    /**
     * Redis 연결 가용 여부 확인
     */
    public boolean isAvailable() {
        return redissonClient != null;
    }

    /**
     * 좌석 락 키 생성
     *
     * @param screeningId 상영 ID
     * @param seatId      좌석 ID
     * @return 락 키
     */
    public String createSeatLockKey(Long screeningId, Long seatId) {
        return LOCK_PREFIX + "screening:" + screeningId + ":seat:" + seatId;
    }

    /**
     * 락 획득 시도 (Fail Fast)
     *
     * @param lockKey   락 키
     * @param waitTime  대기 시간 (밀리초)
     * @param leaseTime 락 보유 시간 (밀리초)
     * @return 락 획득 성공 여부
     */
    public boolean tryLock(String lockKey, long waitTime, long leaseTime) {
        // 1) Redis 분산락 우선
        if (redissonClient != null) {
            try {
                RLock lock = redissonClient.getLock(lockKey);
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
            } catch (Exception e) {
                log.error("[Lock] 락 획득 중 예외 발생: {}, error={}", lockKey, e.getMessage());
                // Redis 장애 시 로컬 락 폴백
            }
        }

        // 2) Redis 미연결/장애 시 로컬 락 폴백 (로컬 개발 편의용)
        ReentrantLock local = localLocks.computeIfAbsent(lockKey, k -> new ReentrantLock());
        try {
            boolean acquired = waitTime <= 0 ? local.tryLock() : local.tryLock(waitTime, TimeUnit.MILLISECONDS);
            if (acquired) {
                log.debug("[Lock] (LOCAL) 락 획득 성공: {}", lockKey);
            } else {
                log.warn("[Lock] (LOCAL) 락 획득 실패: {}", lockKey);
            }
            return acquired;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("[Lock] (LOCAL) 락 획득 중 인터럽트: {}", lockKey, e);
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
     * @param seatId      좌석 ID
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
        // Redis 락 해제
        if (redissonClient != null) {
            try {
                RLock lock = redissonClient.getLock(lockKey);
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                    log.debug("[Lock] 락 해제: {}", lockKey);
                    return;
                }
            } catch (Exception e) {
                log.warn("[Lock] 락 해제 중 예외 발생: {}, error={}", lockKey, e.getMessage());
                // fallthrough
            }
        }

        // 로컬 락 해제
        ReentrantLock local = localLocks.get(lockKey);
        if (local != null && local.isHeldByCurrentThread()) {
            try {
                local.unlock();
                log.debug("[Lock] (LOCAL) 락 해제: {}", lockKey);
            } catch (Exception e) {
                log.warn("[Lock] (LOCAL) 락 해제 중 예외 발생: {}, error={}", lockKey, e.getMessage());
            }
        }
    }

    /**
     * 좌석 락 해제
     *
     * @param screeningId 상영 ID
     * @param seatId      좌석 ID
     */
    public void unlockSeat(Long screeningId, Long seatId) {
        String lockKey = createSeatLockKey(screeningId, seatId);
        unlock(lockKey);
    }

    /**
     * 락을 사용하여 작업 실행
     *
     * @param lockKey 락 키
     * @param action  실행할 작업
     * @param <T>     반환 타입
     * @return 작업 결과
     */
    public <T> T executeWithLock(String lockKey, LockAction<T> action) {
        if (!tryLock(lockKey)) {
            throw new BusinessException(ErrorCode.SEAT_LOCK_FAILED);
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
}
