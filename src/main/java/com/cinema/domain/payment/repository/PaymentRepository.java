package com.cinema.domain.payment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.payment.entity.Payment;
import com.cinema.domain.payment.entity.PaymentStatus;

/**
 * 결제 Repository
 */
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentNo(String paymentNo);

    List<Payment> findByReservationId(Long reservationId);

    Optional<Payment> findByReservationIdAndPayStatus(Long reservationId, PaymentStatus payStatus);

    List<Payment> findByPayStatus(PaymentStatus payStatus);

    /** 결제 완료·기간별 조회 (통계용) */
    List<Payment> findByPayStatusAndPaidAtBetween(
            PaymentStatus payStatus, LocalDateTime start, LocalDateTime end);
}
