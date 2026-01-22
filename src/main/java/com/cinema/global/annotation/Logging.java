package com.cinema.global.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 메서드 로깅 어노테이션
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface Logging {

    LogLevel level() default LogLevel.INFO;

    boolean logParams() default true; // 파라미터 로깅 여부

    boolean logResult() default true; // 결과 로깅 여부

    boolean logExecutionTime() default true; // 실행 시간 로깅 여부

    enum LogLevel {
        DEBUG, INFO, WARN, ERROR
    }
}
