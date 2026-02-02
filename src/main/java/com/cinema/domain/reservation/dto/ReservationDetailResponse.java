package com.cinema.domain.reservation.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.cinema.domain.payment.entity.PaymentMethod;
import com.cinema.domain.payment.entity.PaymentStatus;
import com.cinema.domain.reservation.entity.ReservationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예매 상세 응답 DTO (Step 7)
 * 마이페이지용: payment 필드로 결제 내역 연동 (GET /api/reservations 등)
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
    /** 결제 정보 (SUCCESS 결제가 있을 때만 설정, 마이페이지 결제 내역 표시용) */
    private PaymentSummary payment;

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

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSummary {
        private Long paymentId;
        private String paymentNo;
        private PaymentStatus payStatus;
        private PaymentMethod payMethod;
        private Integer payAmount;
        private LocalDateTime paidAt;
    }
}
