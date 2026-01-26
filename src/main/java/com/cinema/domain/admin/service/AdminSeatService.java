package com.cinema.domain.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.SeatCreateRequest;
import com.cinema.domain.admin.dto.SeatResponse;
import com.cinema.domain.admin.dto.SeatUpdateRequest;
import com.cinema.domain.screening.entity.Seat;
import com.cinema.domain.screening.repository.ScreenRepository;
import com.cinema.domain.screening.repository.SeatRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 좌석 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminSeatService {

    private final SeatRepository seatRepository;
    private final ScreenRepository screenRepository;

    /**
     * 좌석 등록
     */
    @Transactional
    public Long createSeat(SeatCreateRequest request) {
        var screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREEN_NOT_FOUND));

        Seat seat = Seat.builder()
                .screen(screen)
                .rowLabel(request.getRowLabel())
                .seatNo(request.getSeatNo())
                .seatType(request.getSeatType())
                .build();

        return seatRepository.save(seat).getId();
    }

    /**
     * 좌석 수정
     */
    @Transactional
    public void updateSeat(Long seatId, SeatUpdateRequest request) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        if (request.getSeatType() != null) {
            seat.updateInfo(request.getSeatType());
        }

        if (request.getBaseStatus() != null) {
            switch (request.getBaseStatus()) {
                case AVAILABLE -> seat.enable();
                case BLOCKED -> seat.block();
                case DISABLED -> seat.disable();
            }
        }
    }

    /**
     * 좌석 삭제
     */
    @Transactional
    public void deleteSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        seatRepository.delete(seat);
    }

    /**
     * 좌석 목록 조회 (페이징)
     */
    public Page<SeatResponse> getSeats(Pageable pageable) {
        return seatRepository.findAll(pageable)
                .map(SeatResponse::new);
    }

    /**
     * 좌석 상세 조회
     */
    public SeatResponse getSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));

        return new SeatResponse(seat);
    }

    /**
     * 특정 상영관의 좌석 목록 조회
     */
    public List<SeatResponse> getSeatsByScreen(Long screenId) {
        return seatRepository.findByScreenIdOrderByRowLabelAscSeatNoAsc(screenId).stream()
                .map(SeatResponse::new)
                .collect(Collectors.toList());
    }
}
