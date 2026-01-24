package com.cinema.domain.screening.entity;

/**
 * 상영 상태 Enum
 */
public enum ScreeningStatus {

    /** 상영 예정 */
    SCHEDULED,

    /** 상영 중 */
    NOW_SHOWING,

    /** 상영 종료 */
    ENDED,

    /** 상영 취소 */
    CANCELLED
}
