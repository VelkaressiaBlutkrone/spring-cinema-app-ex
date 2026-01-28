package com.cinema.domain.reservation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.domain.reservation.dto.PaymentRequest;
import com.cinema.domain.reservation.dto.PaymentResponse;
import com.cinema.domain.reservation.dto.ReservationDetailResponse;
import com.cinema.domain.reservation.service.ReservationPaymentService;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 예매 API Controller (Step 7)
 *
 * - 결제(예매) 요청, 예매 내역 조회, 예매 취소
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationPaymentService reservationPaymentService;
    private final MemberRepository memberRepository;

    /**
     * 결제(예매) 요청
     * HOLD Token 검증, 서버 가격 계산, Mock 결제, 성공 시 예매 확정
     */
    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> pay(
            @Validated @RequestBody PaymentRequest request,
            Authentication authentication) {
        Long memberId = resolveMemberId(authentication);
        PaymentResponse response = reservationPaymentService.processPayment(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * 예매 내역 조회 (본인)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationDetailResponse>>> getMyReservations(
            Authentication authentication) {
        Long memberId = resolveMemberId(authentication);
        List<ReservationDetailResponse> list = reservationPaymentService.getReservationsByMember(memberId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * 예매 상세 조회
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<ApiResponse<ReservationDetailResponse>> getReservationDetail(
            @PathVariable("reservationId") Long reservationId,
            Authentication authentication) {
        Long memberId = resolveMemberId(authentication);
        ReservationDetailResponse detail = reservationPaymentService.getReservationDetail(memberId, reservationId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    /**
     * 예매 취소 (CONFIRMED → CANCELLED)
     */
    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable("reservationId") Long reservationId,
            Authentication authentication) {
        Long memberId = resolveMemberId(authentication);
        reservationPaymentService.cancelReservation(memberId, reservationId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private Long resolveMemberId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        String loginId = authentication.getName();
        return memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND))
                .getId();
    }
}
