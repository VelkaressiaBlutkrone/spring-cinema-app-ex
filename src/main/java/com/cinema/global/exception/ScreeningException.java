package com.cinema.global.exception;

import lombok.Getter;

/**
 * 상영 스케줄 관련 예외
 */
@Getter
public class ScreeningException extends BusinessException {

    private final Long screeningId;

    public ScreeningException(ErrorCode errorCode) {
        super(errorCode);
        this.screeningId = null;
    }

    public ScreeningException(ErrorCode errorCode, Long screeningId) {
        super(errorCode, String.format("screeningId=%d", screeningId));
        this.screeningId = screeningId;
    }

    public ScreeningException(ErrorCode errorCode, Long screeningId, String additionalMessage) {
        super(errorCode, String.format("screeningId=%d, %s", screeningId, additionalMessage));
        this.screeningId = screeningId;
    }

    // 정적 팩토리 메서드
    public static ScreeningException notFound(Long screeningId) {
        return new ScreeningException(ErrorCode.SCREENING_NOT_FOUND, screeningId);
    }

    public static ScreeningException ended(Long screeningId) {
        return new ScreeningException(ErrorCode.SCREENING_ENDED, screeningId);
    }

    public static ScreeningException cancelled(Long screeningId) {
        return new ScreeningException(ErrorCode.SCREENING_CANCELLED, screeningId);
    }

    public static ScreeningException invalidState(Long screeningId, String currentStatus, String action) {
        return new ScreeningException(ErrorCode.SCREENING_ENDED, screeningId,
                String.format("현재 상태: %s, 요청 작업: %s", currentStatus, action));
    }
}
