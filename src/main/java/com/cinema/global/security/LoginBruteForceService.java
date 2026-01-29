package com.cinema.global.security;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingDeque;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/**
 * 로그인 브루트포스 방어 (OWASP)
 *
 * - loginId당 실패 횟수 제한, 초과 시 일정 시간 잠금
 * - 에러 메시지 최소화 (잠금 여부 노출 금지)
 */
@Slf4j
@Service
public class LoginBruteForceService {

    @Value("${auth.brute-force.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${auth.brute-force.lock-minutes:15}")
    private int lockMinutes;

    private final Map<String, Deque<Long>> failuresByLoginId = new ConcurrentHashMap<>();
    private static final long NANOS_PER_MINUTE = 60_000_000_000L;

    public void checkLocked(String loginId) {
        if (isLocked(loginId)) {
            log.warn("로그인 시도 거부 (잠금): loginId={}", loginId);
            throw new BusinessException(ErrorCode.INVALID_PASSWORD, "아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }

    public void recordFailure(String loginId) {
        long now = System.nanoTime();
        Deque<Long> q = failuresByLoginId.computeIfAbsent(loginId, k -> new LinkedBlockingDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > lockMinutes * NANOS_PER_MINUTE) {
                q.pollFirst();
            }
            q.addLast(now);
        }
    }

    public void clearSuccess(String loginId) {
        failuresByLoginId.remove(loginId);
    }

    private boolean isLocked(String loginId) {
        Deque<Long> q = failuresByLoginId.get(loginId);
        if (q == null) return false;
        long cutoff = System.nanoTime() - lockMinutes * NANOS_PER_MINUTE;
        synchronized (q) {
            return q.stream().filter(t -> t >= cutoff).count() >= maxFailedAttempts;
        }
    }
}
