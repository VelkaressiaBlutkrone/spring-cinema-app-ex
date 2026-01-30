package com.cinema.global.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.cinema.global.exception.ErrorCode;
import com.cinema.infrastructure.redis.RedisRateLimitService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * API Rate Limit (Step 17)
 *
 * - 예매 API: POST hold/release/pay/cancel — 분당 제한 (Redis 기반)
 * - 관리자 API: /api/admin/** — 별도 분당 제한
 * - Redis 미연결 시 허용(서비스 가용성 우선)
 */
@Slf4j
@Component
@Order(-99)
@RequiredArgsConstructor
public class ApiRateLimitFilter extends OncePerRequestFilter {

    private final RedisRateLimitService redisRateLimitService;

    @Value("${reservation.rate-limit.per-minute:60}")
    private int reservationPerMinute;

    @Value("${admin.rate-limit.per-minute:120}")
    private int adminPerMinute;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod() != null ? request.getMethod() : "";

        String rateKey = null;
        int limit = -1;
        boolean isAdmin = path != null && path.startsWith("/api/admin/");
        boolean isReservation = isReservationPath(path, method);

        if (isAdmin) {
            rateKey = "admin:ip:" + clientKey(request);
            limit = adminPerMinute;
        } else if (isReservation) {
            rateKey = "reservation:ip:" + clientKey(request);
            limit = reservationPerMinute;
        }

        if (rateKey == null || limit <= 0) {
            chain.doFilter(request, response);
            return;
        }

        if (!redisRateLimitService.tryAcquire(rateKey, limit, 60)) {
            log.warn("[RateLimit] API 초과 - key={}, path={}", rateKey, path);
            sendTooManyRequests(response);
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isReservationPath(String path, String method) {
        if (path == null || !"POST".equalsIgnoreCase(method)) {
            return false;
        }
        if ("/api/reservations/pay".equals(path)) {
            return true;
        }
        if (path.startsWith("/api/reservations/") && path.endsWith("/cancel")) {
            return true;
        }
        if (path != null && path.matches(".*/api/screenings/\\d+/seats/\\d+/hold")) {
            return true;
        }
        return path != null && path.contains("/holds/release") && path.startsWith("/api/screenings");
    }

    private void sendTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format(
                "{\"status\":429,\"code\":\"%s\",\"message\":\"%s\"}",
                ErrorCode.TOO_MANY_REQUESTS.getCode(),
                ErrorCode.TOO_MANY_REQUESTS.getMessage()));
    }

    private static String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote != null ? remote : "unknown";
    }
}
