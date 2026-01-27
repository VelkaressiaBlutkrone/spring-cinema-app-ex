package com.cinema.domain.screening.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.entity.SeatType;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 가격 계산 도메인 서비스 (Step 7)
 *
 * RULE 3.3: 가격 계산은 Domain Service에서만 수행
 * - 가격 정책 미구현 시 좌석 타입별 기본가 적용
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceCalculateService {

    private final ScreeningSeatRepository screeningSeatRepository;

    @Value("${price.default.normal:10000}")
    private int priceNormal;

    @Value("${price.default.premium:15000}")
    private int pricePremium;

    @Value("${price.default.vip:20000}")
    private int priceVip;

    @Value("${price.default.couple:25000}")
    private int priceCouple;

    @Value("${price.default.wheelchair:10000}")
    private int priceWheelchair;

    /**
     * 상영·좌석 목록에 대한 좌석별 가격 및 총액 계산
     * 서버에서만 호출하며 클라이언트 가격은 신뢰하지 않음.
     */
    public PriceResult calculate(Long screeningId, List<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "좌석 목록이 비어 있습니다.");
        }

        List<ScreeningSeat> seats = seatIds.stream()
                .map(seatId -> screeningSeatRepository.findByScreeningIdAndSeatId(screeningId, seatId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND)))
                .toList();

        Map<Long, Integer> priceBySeatId = seats.stream()
                .collect(Collectors.toMap(
                        ss -> ss.getSeat().getId(),
                        ss -> basePriceFor(ss.getSeat().getSeatType())));

        int totalAmount = priceBySeatId.values().stream().mapToInt(Integer::intValue).sum();

        return new PriceResult(priceBySeatId, totalAmount);
    }

    private int basePriceFor(SeatType type) {
        return switch (type) {
            case NORMAL -> priceNormal;
            case PREMIUM -> pricePremium;
            case VIP -> priceVip;
            case COUPLE -> priceCouple;
            case WHEELCHAIR -> priceWheelchair;
        };
    }

    /**
     * 좌석별 가격 맵 + 총액
     */
    public record PriceResult(Map<Long, Integer> priceBySeatId, int totalAmount) {}
}
