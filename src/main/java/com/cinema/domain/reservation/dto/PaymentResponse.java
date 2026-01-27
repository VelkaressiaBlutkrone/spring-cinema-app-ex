package com.cinema.domain.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 결제(예매) 완료 응답 DTO (Step 7)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long reservationId;
    private String reservationNo;
    private Long screeningId;
    private Integer totalSeats;
    private Integer totalAmount;
}
