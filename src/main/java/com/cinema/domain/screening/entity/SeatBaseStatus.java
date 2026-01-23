package com.cinema.domain.screening.entity;

/**
 * 좌석 기본 상태 Enum (관리자 설정)
 * 
 * 관리자가 설정하는 좌석의 기본 상태
 * 실제 상영별 상태는 SeatStatus로 관리
 */
public enum SeatBaseStatus {
    
    /** 예매 가능 */
    AVAILABLE,
    
    /** 운영 차단 (관리자 설정) */
    BLOCKED,
    
    /** 물리적 사용 불가 (관리자 설정) */
    DISABLED
}
