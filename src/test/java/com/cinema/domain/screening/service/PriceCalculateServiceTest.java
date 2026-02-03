package com.cinema.domain.screening.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.cinema.domain.screening.entity.ScreeningSeat;
import com.cinema.domain.screening.entity.Seat;
import com.cinema.domain.screening.entity.SeatType;
import com.cinema.domain.screening.repository.ScreeningSeatRepository;
import com.cinema.global.exception.BusinessException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("PriceCalculateService 단위 테스트")
class PriceCalculateServiceTest {

    @Mock
    private ScreeningSeatRepository screeningSeatRepository;

    private PriceCalculateService priceCalculateService;

    @BeforeEach
    void setUp() {
        priceCalculateService = new PriceCalculateService(screeningSeatRepository);
        ReflectionTestUtils.setField(priceCalculateService, "priceNormal", 10000);
        ReflectionTestUtils.setField(priceCalculateService, "pricePremium", 15000);
        ReflectionTestUtils.setField(priceCalculateService, "priceVip", 20000);
        ReflectionTestUtils.setField(priceCalculateService, "priceCouple", 25000);
        ReflectionTestUtils.setField(priceCalculateService, "priceWheelchair", 10000);
    }

    @Nested
    @DisplayName("calculate")
    class Calculate {
        @Test
        void 좌석_목록_비어있으면_예외() {
            // given: 상영 ID 1L, 빈 좌석 ID 목록
            // when & then: calculate 호출 시 BusinessException 발생
            assertThatThrownBy(() -> priceCalculateService.calculate(1L, List.of()))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        void 좌석_목록_null이면_예외() {
            // given: 상영 ID 1L, null 좌석 목록
            // when & then: calculate 호출 시 BusinessException 발생
            assertThatThrownBy(() -> priceCalculateService.calculate(1L, null))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        void NORMAL_좌석_가격_계산() {
            // given: NORMAL 타입 좌석 1개, repository가 해당 ScreeningSeat 반환하도록 설정
            ScreeningSeat ss = createMockScreeningSeat(1L, SeatType.NORMAL);
            when(screeningSeatRepository.findByScreeningIdAndSeatId(1L, 1L))
                    .thenReturn(Optional.of(ss));

            // when: calculate(상영ID, 좌석ID 목록) 호출
            var result = priceCalculateService.calculate(1L, List.of(1L));

            // then: 좌석별 10000원, 총액 10000원
            assertThat(result.priceBySeatId()).containsEntry(1L, 10000);
            assertThat(result.totalAmount()).isEqualTo(10000);
        }

        @Test
        void 다중_좌석_총액_계산() {
            // given: NORMAL 1개, PREMIUM 1개 좌석, repository mock 설정
            ScreeningSeat ss1 = createMockScreeningSeat(1L, SeatType.NORMAL);
            ScreeningSeat ss2 = createMockScreeningSeat(2L, SeatType.PREMIUM);
            when(screeningSeatRepository.findByScreeningIdAndSeatId(1L, 1L))
                    .thenReturn(Optional.of(ss1));
            when(screeningSeatRepository.findByScreeningIdAndSeatId(1L, 2L))
                    .thenReturn(Optional.of(ss2));

            // when: calculate(상영ID, [1L, 2L]) 호출
            var result = priceCalculateService.calculate(1L, List.of(1L, 2L));

            // then: 좌석별 가격 10000/15000, 총액 25000
            assertThat(result.priceBySeatId()).containsEntry(1L, 10000).containsEntry(2L, 15000);
            assertThat(result.totalAmount()).isEqualTo(25000);
        }

        @Test
        void 존재하지_않는_좌석이면_예외() {
            // given: 존재하지 않는 좌석 ID 999L, repository가 empty 반환
            when(screeningSeatRepository.findByScreeningIdAndSeatId(eq(1L), eq(999L)))
                    .thenReturn(Optional.empty());

            // when & then: calculate 호출 시 BusinessException 발생
            assertThatThrownBy(() -> priceCalculateService.calculate(1L, List.of(999L)))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        void VIP_좌석_가격() {
            // given: VIP 타입 좌석 1개, repository mock 설정
            ScreeningSeat ss = createMockScreeningSeat(1L, SeatType.VIP);
            when(screeningSeatRepository.findByScreeningIdAndSeatId(1L, 1L))
                    .thenReturn(Optional.of(ss));

            // when: calculate(상영ID, [1L]) 호출
            var result = priceCalculateService.calculate(1L, List.of(1L));

            // then: 좌석별 20000원
            assertThat(result.priceBySeatId()).containsEntry(1L, 20000);
        }
    }

    private ScreeningSeat createMockScreeningSeat(long seatId, SeatType seatType) {
        Seat seat = mock(Seat.class);
        when(seat.getId()).thenReturn(seatId);
        when(seat.getSeatType()).thenReturn(seatType);

        ScreeningSeat ss = mock(ScreeningSeat.class);
        when(ss.getSeat()).thenReturn(seat);
        return ss;
    }
}
