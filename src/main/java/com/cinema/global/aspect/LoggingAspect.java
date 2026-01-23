package com.cinema.global.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.cinema.global.annotation.Logging;
import com.cinema.global.annotation.Logging.LogLevel;
import com.google.gson.Gson;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * @Logging 어노테이션 처리 Aspect
 * 
 * RULE: 개인정보, 결제 상세 정보, JWT Token 전체 값은 로그에 기록하지 않음
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final Gson gson;
    private static final int MAX_LOG_LENGTH = 500;

    // 민감 정보 필드명 목록 (로그에서 마스킹 처리)
    private static final String[] SENSITIVE_FIELDS = {
        "password", "pwd", "secret", "token", "cardNumber", "cvv", "accountNumber"
    };

    @Around("@annotation(logging)")
    public Object logMethod(ProceedingJoinPoint joinPoint, Logging logging) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();

        // 메서드 시작 로깅
        logStart(methodName, joinPoint.getArgs(), logging);

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            // 메서드 종료 로깅
            logEnd(methodName, result, executionTime, logging);

            return result;
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logError(methodName, e, executionTime, logging);
            throw e;
        }
    }

    private void logStart(String methodName, Object[] args, Logging logging) {
        String message;
        if (logging.logParams() && args != null && args.length > 0) {
            String params = truncate(maskSensitiveData(toJson(args)));
            message = String.format("[START] %s - params: %s", methodName, params);
        } else {
            message = String.format("[START] %s", methodName);
        }
        logByLevel(logging.level(), message);
    }

    private void logEnd(String methodName, Object result, long executionTime, Logging logging) {
        String message;
        if (logging.logResult() && result != null) {
            String resultStr = truncate(maskSensitiveData(toJson(result)));
            message = String.format("[END] %s - result: %s, time: %dms", methodName, resultStr, executionTime);
        } else if (logging.logExecutionTime()) {
            message = String.format("[END] %s - time: %dms", methodName, executionTime);
        } else {
            message = String.format("[END] %s", methodName);
        }
        logByLevel(logging.level(), message);
    }

    private void logError(String methodName, Exception e, long executionTime, Logging logging) {
        log.error("[ERROR] {} - exception: {}, time: {}ms", methodName, e.getMessage(), executionTime);
    }

    private void logByLevel(LogLevel level, String message) {
        switch (level) {
            case DEBUG -> log.debug(message);
            case INFO -> log.info(message);
            case WARN -> log.warn(message);
            case ERROR -> log.error(message);
        }
    }

    private String toJson(Object obj) {
        try {
            return gson.toJson(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }

    private String truncate(String str) {
        if (str == null) return "null";
        return str.length() > MAX_LOG_LENGTH
                ? str.substring(0, MAX_LOG_LENGTH) + "...(truncated)"
                : str;
    }

    /**
     * 민감 정보 마스킹 처리
     */
    private String maskSensitiveData(String json) {
        String result = json;
        for (String field : SENSITIVE_FIELDS) {
            // "password":"value" 패턴을 "password":"****"로 변경
            result = result.replaceAll(
                "\"" + field + "\"\\s*:\\s*\"[^\"]*\"",
                "\"" + field + "\":\"****\""
            );
        }
        return result;
    }
}
