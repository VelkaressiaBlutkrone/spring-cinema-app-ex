package com.cinema.domain.admin.dto;

import java.time.LocalDateTime;

import com.cinema.domain.payment.entity.PaymentMethod;
import com.cinema.domain.payment.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자 결제 목록 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentListResponse {

    private Long paymentId;
    private String paymentNo;
    private PaymentStatus payStatus;
    private PaymentMethod payMethod;
    private Integer payAmount;
    private Long reservationId;
    private String reservationNo;
    private Long memberId;
    private String memberLoginId;
    private String movieTitle;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
}
