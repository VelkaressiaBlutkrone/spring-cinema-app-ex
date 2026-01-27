package com.cinema.domain.reservation.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.cinema.domain.reservation.entity.ReservationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예매 상세 응답 DTO (Step 7)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDetailResponse {

    private Long reservationId;
    private String reservationNo;
    private ReservationStatus status;
    private Long memberId;
    private Long screeningId;
    private String movieTitle;
    private String screenName;
    private LocalDateTime startTime;
    private Integer totalSeats;
    private Integer totalAmount;
    private List<SeatItem> seats;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatItem {
        private Long seatId;
        private String rowLabel;
        private Integer seatNo;
        private String displayName;
        private Integer price;
    }
}
