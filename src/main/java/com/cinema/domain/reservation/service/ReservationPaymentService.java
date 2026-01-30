package com.cinema.domain.reservation.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.domain.payment.entity.Payment;
import com.cinema.domain.payment.repository.PaymentRepository;
import com.cinema.domain.payment.service.MockPaymentService;
import com.cinema.domain.reservation.dto.PaymentRequest;
import com.cinema.domain.reservation.dto.PaymentResponse;
import com.cinema.domain.reservation.dto.ReservationDetailResponse;
import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationSeat;
import com.cinema.domain.reservation.repository.ReservationRepository;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;
import com.cinema.domain.screening.service.PriceCalculateService;
import com.cinema.domain.screening.service.PriceCalculateService.PriceResult;
import com.cinema.domain.screening.service.SeatCommandService;
import com.cinema.domain.reservation.entity.ReservationStatus;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.global.exception.ReservationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 예매·결제 트랜잭션 서비스 (Step 7)
 *
 * RULE: 결제 검증 → DB 저장 → Redis 정리
 * - HOLD Token 검증, 가격은 서버에서만 계산
 * - Mock 결제 성공 시에만 예매·결제·RESERVED 저장 후 Redis HOLD 정리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationPaymentService {

    private final PriceCalculateService priceCalculateService;
    private final MockPaymentService mockPaymentService;
    private final SeatCommandService seatCommandService;
    private final MemberRepository memberRepository;
    private final ScreeningRepository screeningRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;

    /**
     * 결제 요청 처리
     * 1) holdToken 검증, 가격 계산(서버만)
     * 2) 각 좌석 HOLD → PAYMENT_PENDING
     * 3) Mock 결제 호출
     * 4) 성공 시: 예매·결제 저장, PAYMENT_PENDING → RESERVED, Redis 정리
     * 5) 실패 시: PAYMENT_PENDING → AVAILABLE, Redis 정리
     */
    @Transactional
    public PaymentResponse processPayment(Long memberId, PaymentRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREENING_NOT_FOUND));
        screening.validateBookable();

        List<Long> seatIds = request.getSeatHoldItems().stream()
                .map(PaymentRequest.SeatHoldItem::getSeatId)
                .toList();
        PriceResult priceResult = priceCalculateService.calculate(request.getScreeningId(), seatIds);

        for (PaymentRequest.SeatHoldItem item : request.getSeatHoldItems()) {
            seatCommandService.startPaymentForReservation(
                    request.getScreeningId(), item.getSeatId(), item.getHoldToken(), memberId);
        }

        boolean paySuccess = mockPaymentService.processPayment(
                priceResult.totalAmount(), request.getPayMethod());

        if (!paySuccess) {
            log.warn("[ReservationPayment] 결제 실패 - memberId={}, screeningId={}, amount={} (결제 상세 미기록)",
                    memberId, request.getScreeningId(), priceResult.totalAmount());
            for (PaymentRequest.SeatHoldItem item : request.getSeatHoldItems()) {
                seatCommandService.releaseOnPaymentFailure(request.getScreeningId(), item.getSeatId());
            }
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "결제에 실패했습니다.");
        }

        String firstToken = request.getSeatHoldItems().get(0).getHoldToken();
        Reservation reservation = Reservation.builder()
                .member(member)
                .screening(screening)
                .holdToken(firstToken)
                .build();
        reservation.startPayment();

        List<ScreeningSeat> screeningSeats = request.getSeatHoldItems().stream()
                .map(item -> screeningSeatRepository.findByScreeningIdAndSeatId(
                                request.getScreeningId(), item.getSeatId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND)))
                .toList();

        screeningSeats.forEach(ss -> {
            int price = priceResult.priceBySeatId().get(ss.getSeat().getId());
            reservation.addSeat(ReservationSeat.builder()
                    .reservation(reservation)
                    .screeningSeat(ss)
                    .seat(ss.getSeat())
                    .price(price)
                    .build());
        });

        reservationRepository.save(reservation);

        Payment payment = Payment.builder()
                .reservation(reservation)
                .payMethod(request.getPayMethod())
                .payAmount(priceResult.totalAmount())
                .build();
        paymentRepository.save(payment);
        payment.success("MOCK-PG-" + System.currentTimeMillis());
        paymentRepository.save(payment);

        for (int i = 0; i < request.getSeatHoldItems().size(); i++) {
            PaymentRequest.SeatHoldItem item = request.getSeatHoldItems().get(i);
            seatCommandService.reserveForPayment(
                    request.getScreeningId(), item.getSeatId(), memberId, item.getHoldToken());
        }
        reservation.confirm();
        reservationRepository.save(reservation);

        log.info("[ReservationPayment] 예매 완료 - reservationId={}, memberId={}, amount={}",
                reservation.getId(), memberId, priceResult.totalAmount());

        return PaymentResponse.builder()
                .reservationId(reservation.getId())
                .reservationNo(reservation.getReservationNo())
                .screeningId(request.getScreeningId())
                .totalSeats(reservation.getTotalSeats())
                .totalAmount(reservation.getTotalAmount())
                .build();
    }

    /**
     * 예매 취소: RESERVED → CANCELLED, Payment 취소, 좌석 상태 CANCELLED
     */
    @Transactional
    public void cancelReservation(Long memberId, Long reservationId) {
        Reservation reservation = reservationRepository.findByIdWithDetails(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (!reservation.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw ReservationException.cannotCancel(reservationId, "확정된 예매만 취소할 수 있습니다.");
        }
        reservation.cancel();
        paymentRepository.findByReservationIdAndPayStatus(reservationId, com.cinema.domain.payment.entity.PaymentStatus.SUCCESS)
                .ifPresent(p -> {
                    p.cancel();
                    paymentRepository.save(p);
                });
        Long screeningId = reservation.getScreening().getId();
        reservation.getReservationSeats().forEach(rs -> {
            Long seatId = rs.getSeat().getId();
            seatCommandService.cancelForReservation(screeningId, seatId);
        });
        reservationRepository.save(reservation);
        log.info("[ReservationPayment] 예매 취소 - reservationId={}, memberId={}", reservationId, memberId);
    }

    /**
     * 예매 상세 조회
     */
    @Transactional(readOnly = true)
    public ReservationDetailResponse getReservationDetail(Long memberId, Long reservationId) {
        Reservation r = reservationRepository.findByIdWithDetails(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (!r.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        var seats = r.getReservationSeats().stream()
                .map(rs -> ReservationDetailResponse.SeatItem.builder()
                        .seatId(rs.getSeat().getId())
                        .rowLabel(rs.getSeat().getRowLabel())
                        .seatNo(rs.getSeat().getSeatNo())
                        .displayName(rs.getSeatDisplayName())
                        .price(rs.getPrice())
                        .build())
                .toList();
        return ReservationDetailResponse.builder()
                .reservationId(r.getId())
                .reservationNo(r.getReservationNo())
                .status(r.getStatus())
                .memberId(r.getMember().getId())
                .screeningId(r.getScreening().getId())
                .movieTitle(r.getScreening().getMovie().getTitle())
                .screenName(r.getScreening().getScreen().getName())
                .startTime(r.getScreening().getStartTime())
                .totalSeats(r.getTotalSeats())
                .totalAmount(r.getTotalAmount())
                .seats(seats)
                .createdAt(r.getCreatedAt())
                .build();
    }

    /**
     * 회원의 예매 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ReservationDetailResponse> getReservationsByMember(Long memberId) {
        return reservationRepository.findByMemberIdWithDetails(memberId).stream()
                .map(r -> {
                    var seats = r.getReservationSeats().stream()
                            .map(rs -> ReservationDetailResponse.SeatItem.builder()
                                    .seatId(rs.getSeat().getId())
                                    .rowLabel(rs.getSeat().getRowLabel())
                                    .seatNo(rs.getSeat().getSeatNo())
                                    .displayName(rs.getSeatDisplayName())
                                    .price(rs.getPrice())
                                    .build())
                            .toList();
                    return ReservationDetailResponse.builder()
                            .reservationId(r.getId())
                            .reservationNo(r.getReservationNo())
                            .status(r.getStatus())
                            .memberId(r.getMember().getId())
                            .screeningId(r.getScreening().getId())
                            .movieTitle(r.getScreening().getMovie().getTitle())
                            .screenName(r.getScreening().getScreen().getName())
                            .startTime(r.getScreening().getStartTime())
                            .totalSeats(r.getTotalSeats())
                            .totalAmount(r.getTotalAmount())
                            .seats(seats)
                            .createdAt(r.getCreatedAt())
                            .build();
                })
                .toList();
    }
}
