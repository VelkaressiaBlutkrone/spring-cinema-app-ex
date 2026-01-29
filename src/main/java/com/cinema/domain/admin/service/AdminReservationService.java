package com.cinema.domain.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.ReservationListResponse;
import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.domain.movie.entity.Movie;
import com.cinema.domain.movie.repository.MovieRepository;
import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationStatus;
import com.cinema.domain.reservation.repository.ReservationRepository;
import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.repository.ScreenRepository;
import com.cinema.domain.screening.repository.ScreeningRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 예매 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReservationService {

    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final MovieRepository movieRepository;
    private final ScreeningRepository screeningRepository;
    private final ScreenRepository screenRepository;

    /**
     * 예매 목록 조회 (필터링, 정렬, 페이지네이션)
     */
    public Page<ReservationListResponse> getReservations(
            LocalDate startDate,
            LocalDate endDate,
            Long movieId,
            Long memberId,
            ReservationStatus status,
            Pageable pageable) {

        // 날짜 범위 설정
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        // QueryDSL을 사용한 복잡한 쿼리는 ReservationRepositoryCustom에 구현
        // 여기서는 간단하게 Spring Data JPA로 처리
        Page<Reservation> reservations = reservationRepository.findAll(pageable);

        // 필터링 적용
        List<Reservation> filtered = reservations.getContent().stream()
                .filter(r -> startDateTime == null || r.getCreatedAt().isAfter(startDateTime)
                        || r.getCreatedAt().isEqual(startDateTime))
                .filter(r -> endDateTime == null || r.getCreatedAt().isBefore(endDateTime)
                        || r.getCreatedAt().isEqual(endDateTime))
                .filter(r -> movieId == null || r.getScreening().getMovie().getId().equals(movieId))
                .filter(r -> memberId == null || r.getMember().getId().equals(memberId))
                .filter(r -> status == null || r.getStatus() == status)
                .toList();

        // DTO 변환
        List<ReservationListResponse> content = filtered.stream()
                .map(this::toListResponse)
                .toList();

        // Page 객체 재구성 (간단한 구현, 실제로는 QueryDSL로 필터링된 Page 반환 권장)
        return new org.springframework.data.domain.PageImpl<>(content, pageable, filtered.size());
    }

    /**
     * 예매 상세 조회
     */
    public com.cinema.domain.reservation.dto.ReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        return toDetailResponse(reservation);
    }

    /**
     * 취소 내역 조회
     */
    public Page<ReservationListResponse> getCancelledReservations(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {
        return getReservations(startDate, endDate, null, null, ReservationStatus.CANCELLED, pageable);
    }

    // ========================================
    // Helper
    // ========================================

    private ReservationListResponse toListResponse(Reservation reservation) {
        Screening screening = reservation.getScreening();
        Movie movie = screening.getMovie();
        Screen screen = screening.getScreen();
        Member member = reservation.getMember();

        return ReservationListResponse.builder()
                .reservationId(reservation.getId())
                .reservationNo(reservation.getReservationNo())
                .status(reservation.getStatus())
                .memberId(member.getId())
                .memberLoginId(member.getLoginId())
                .screeningId(screening.getId())
                .movieTitle(movie.getTitle())
                .screenName(screen.getName())
                .startTime(screening.getStartTime())
                .totalSeats(reservation.getTotalSeats())
                .totalAmount(reservation.getTotalAmount())
                .createdAt(reservation.getCreatedAt())
                .build();
    }

    private com.cinema.domain.reservation.dto.ReservationDetailResponse toDetailResponse(Reservation reservation) {
        Screening screening = reservation.getScreening();
        Movie movie = screening.getMovie();
        Screen screen = screening.getScreen();

        List<com.cinema.domain.reservation.dto.ReservationDetailResponse.SeatItem> seatItems = reservation
                .getReservationSeats().stream()
                .map(rs -> com.cinema.domain.reservation.dto.ReservationDetailResponse.SeatItem.builder()
                        .seatId(rs.getSeat().getId())
                        .rowLabel(rs.getSeat().getRowLabel())
                        .seatNo(rs.getSeat().getSeatNo())
                        .displayName(rs.getSeat().getRowLabel() + "-" + rs.getSeat().getSeatNo())
                        .price(rs.getPrice())
                        .build())
                .toList();

        return com.cinema.domain.reservation.dto.ReservationDetailResponse.builder()
                .reservationId(reservation.getId())
                .reservationNo(reservation.getReservationNo())
                .status(reservation.getStatus())
                .memberId(reservation.getMember().getId())
                .screeningId(screening.getId())
                .movieTitle(movie.getTitle())
                .screenName(screen.getName())
                .startTime(screening.getStartTime())
                .totalSeats(reservation.getTotalSeats())
                .totalAmount(reservation.getTotalAmount())
                .seats(seatItems)
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}
