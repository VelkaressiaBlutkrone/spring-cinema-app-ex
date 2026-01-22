package com.cinema.global.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.cinema.global.annotation.Logging;
import com.google.gson.Gson;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * @Logging 어노테이션 처리 Aspect
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final Gson gson;
    private static final int MAX_LOG_LENGTH = 500;

    @Around("@annotation(logging)")
    public Object logMethod(ProceedingJoinPoint joinPoint, Logging logging) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();

        // 메서드 시작 로깅
        if (logging.logParams()) {
            String params = truncate(gson.toJson(joinPoint.getArgs()));
            log.info("[START] {} - params: {}", methodName, params);
        } else {
            log.info("[START] {}", methodName);
        }

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            // 메서드 종료 로깅
            if (logging.logResult()) {
                String resultStr = truncate(gson.toJson(result));
                log.info("[END] {} - result: {}, time: {}ms", methodName, resultStr, executionTime);
            } else if (logging.logExecutionTime()) {
                log.info("[END] {} - time: {}ms", methodName, executionTime);
            }

            return result;
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("[ERROR] {} - exception: {}, time: {}ms", methodName, e.getMessage(), executionTime);
            throw e;
        }
    }

    private String truncate(String str) {
        return str.length() > MAX_LOG_LENGTH
                ? str.substring(0, MAX_LOG_LENGTH) + "..."
                : str;
    }
}
