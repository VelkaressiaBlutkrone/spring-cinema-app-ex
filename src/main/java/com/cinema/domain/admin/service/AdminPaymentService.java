package com.cinema.domain.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.PaymentListResponse;
import com.cinema.domain.member.entity.Member;
import com.cinema.domain.payment.entity.Payment;
import com.cinema.domain.payment.entity.PaymentStatus;
import com.cinema.domain.payment.repository.PaymentRepository;
import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.repository.ReservationRepository;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 결제 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final ScreeningRepository screeningRepository;

    /**
     * 결제 목록 조회 (필터링, 정렬, 페이지네이션)
     */
    public Page<PaymentListResponse> getPayments(
            LocalDate startDate,
            LocalDate endDate,
            PaymentStatus payStatus,
            Long memberId,
            Pageable pageable) {

        // 날짜 범위 설정
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        // 간단한 구현 (실제로는 QueryDSL로 필터링된 Page 반환 권장)
        Page<Payment> payments = paymentRepository.findAll(pageable);

        // 필터링 적용
        List<Payment> filtered = payments.getContent().stream()
                .filter(p -> startDateTime == null || p.getCreatedAt().isAfter(startDateTime)
                        || p.getCreatedAt().isEqual(startDateTime))
                .filter(p -> endDateTime == null || p.getCreatedAt().isBefore(endDateTime)
                        || p.getCreatedAt().isEqual(endDateTime))
                .filter(p -> payStatus == null || p.getPayStatus() == payStatus)
                .filter(p -> memberId == null || p.getReservation().getMember().getId().equals(memberId))
                .toList();

        // DTO 변환
        List<PaymentListResponse> content = filtered.stream()
                .map(this::toListResponse)
                .toList();

        return new org.springframework.data.domain.PageImpl<>(content, pageable, filtered.size());
    }

    /**
     * 결제 상세 조회
     */
    public PaymentListResponse getPaymentDetail(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        return toListResponse(payment);
    }

    /**
     * 취소된 결제 내역 조회
     */
    public Page<PaymentListResponse> getCancelledPayments(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {
        return getPayments(startDate, endDate, PaymentStatus.CANCELLED, null, pageable);
    }

    // ========================================
    // Helper
    // ========================================

    private PaymentListResponse toListResponse(Payment payment) {
        Reservation reservation = payment.getReservation();
        Member member = reservation.getMember();
        Screening screening = reservation.getScreening();

        return PaymentListResponse.builder()
                .paymentId(payment.getId())
                .paymentNo(payment.getPaymentNo())
                .payStatus(payment.getPayStatus())
                .payMethod(payment.getPayMethod())
                .payAmount(payment.getPayAmount())
                .reservationId(reservation.getId())
                .reservationNo(reservation.getReservationNo())
                .memberId(member.getId())
                .memberLoginId(member.getLoginId())
                .movieTitle(screening.getMovie().getTitle())
                .paidAt(payment.getPaidAt())
                .cancelledAt(payment.getCancelledAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
