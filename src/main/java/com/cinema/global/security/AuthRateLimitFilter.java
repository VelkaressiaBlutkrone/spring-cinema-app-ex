package com.cinema.global.security;

import java.io.IOException;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingDeque;

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

import lombok.extern.slf4j.Slf4j;

/**
 * 인증 API Rate Limiting (OWASP DoS 방어)
 *
 * - /api/members/login, signup, refresh per-IP 분당 제한
 */
@Slf4j
@Component
@Order(-100)
public class AuthRateLimitFilter extends OncePerRequestFilter {

    @Value("${auth.rate-limit.login-per-minute:10}")
    private int loginPerMinute;

    @Value("${auth.rate-limit.signup-per-minute:5}")
    private int signupPerMinute;

    @Value("${auth.rate-limit.refresh-per-minute:20}")
    private int refreshPerMinute;

    private final Map<String, Deque<Long>> loginTimes = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> signupTimes = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> refreshTimes = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        if (!"POST".equalsIgnoreCase(method)) {
            chain.doFilter(request, response);
            return;
        }

        String key = clientKey(request);
        int limit;
        Map<String, Deque<Long>> store;
        if (path != null && path.contains("/members/login")) {
            limit = loginPerMinute;
            store = loginTimes;
        } else if (path != null && path.contains("/members/signup")) {
            limit = signupPerMinute;
            store = signupTimes;
        } else if (path != null && path.contains("/members/refresh")) {
            limit = refreshPerMinute;
            store = refreshTimes;
        } else {
            chain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        Deque<Long> times = store.computeIfAbsent(key, k -> new LinkedBlockingDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() > 60_000) {
                times.pollFirst();
            }
            if (times.size() >= limit) {
                log.warn("Rate limit exceeded: path={}, key={}", path, key);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"status\":429,\"code\":\"RATE_LIMIT\",\"message\":\"요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.\"}");
                return;
            }
            times.addLast(now);
        }

        chain.doFilter(request, response);
    }

    private static String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
