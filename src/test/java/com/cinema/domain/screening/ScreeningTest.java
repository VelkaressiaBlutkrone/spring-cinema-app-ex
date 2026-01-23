package com.cinema.domain.screening;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Screening Aggregate Domain Unit Test
 * RULE.md 3. Domain 규칙 및 4. 좌석 상태 관리 규칙 준수 여부 테스트
 */
class ScreeningTest {

    private Screening screening;
    private Seat availableSeat;
    private Seat holdSeat;
    private Seat reservedSeat;

    @BeforeEach
    void setUp() {
        // 테스트용 좌석 데이터 준비
        availableSeat = Seat.builder()
                .seatId(1L)
                .seatNo("A1")
                .status(SeatStatus.AVAILABLE)
                .build();

        holdSeat = Seat.builder()
                .seatId(2L)
                .seatNo("A2")
                .status(SeatStatus.HOLD)
                .build();

        reservedSeat = Seat.builder()
                .seatId(3L)
                .seatNo("A3")
                .status(SeatStatus.RESERVED)
                .build();

        List<Seat> seats = new ArrayList<>();
        seats.add(availableSeat);
        seats.add(holdSeat);
        seats.add(reservedSeat);

        // Screening Aggregate 생성
        screening = Screening.builder()
                .screeningId(1L)
                .seats(seats)
                .build();
    }

    @Test
    @DisplayName("좌석 HOLD 성공 - AVAILABLE 상태일 때")
    void holdSeat_Success() {
        // When
        screening.holdSeat(1L);

        // Then
        assertThat(availableSeat.getStatus()).isEqualTo(SeatStatus.HOLD);
    }

    @Test
    @DisplayName("좌석 HOLD 실패 - 이미 RESERVED 상태일 때")
    void holdSeat_Fail_WhenReserved() {
        // When & Then
        assertThatThrownBy(() -> screening.holdSeat(3L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("예매 가능한 상태가 아닙니다");
    }

    @Test
    @DisplayName("좌석 HOLD 실패 - 이미 HOLD 상태일 때")
    void holdSeat_Fail_WhenAlreadyHold() {
        // When & Then
        assertThatThrownBy(() -> screening.holdSeat(2L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 선점된 좌석입니다");
    }

    @Test
    @DisplayName("좌석 예매(RESERVE) 성공 - HOLD 상태일 때")
    void reserveSeat_Success() {
        // When
        screening.reserveSeat(2L);

        // Then
        assertThat(holdSeat.getStatus()).isEqualTo(SeatStatus.RESERVED);
    }

    @Test
    @DisplayName("존재하지 않는 좌석 요청 시 예외 발생")
    void findSeat_Fail_WhenNotFound() {
        // When & Then
        assertThatThrownBy(() -> screening.holdSeat(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("좌석을 찾을 수 없습니다");
    }
}
