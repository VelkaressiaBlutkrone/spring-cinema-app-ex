package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import com.cinema.domain.reservation.entity.ReservationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자 예매 목록 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationListResponse {

    private Long reservationId;
    private String reservationNo;
    private ReservationStatus status;
    private Long memberId;
    private String memberLoginId;
    private Long screeningId;
    private String movieTitle;
    private String screenName;
    private LocalDateTime startTime;
    private Integer totalSeats;
    private Integer totalAmount;
    private LocalDateTime createdAt;
}
