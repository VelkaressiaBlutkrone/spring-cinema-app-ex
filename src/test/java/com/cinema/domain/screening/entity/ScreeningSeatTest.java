package com.cinema.domain.screening.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.cinema.domain.member.entity.Member;
import com.cinema.global.exception.SeatException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("ScreeningSeat 단위 테스트")
class ScreeningSeatTest {

    private Screening screening;
    private Seat seat;
    private Member member;

    @BeforeEach
    void setUp() {
        screening = mock(Screening.class);
        when(screening.getId()).thenReturn(1L);
        seat = mock(Seat.class);
        when(seat.getId()).thenReturn(1L);
        member = mock(Member.class);
    }

    @Nested
    @DisplayName("hold")
    class Hold {
        @Test
        void AVAILABLE에서_HOLD_성공() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            ss.hold(member, "token-123", 7);

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.HOLD);
            assertThat(ss.getHoldToken()).isEqualTo("token-123");
            assertThat(ss.getHoldMember()).isEqualTo(member);
            assertThat(ss.getHoldExpireAt()).isNotNull();
        }

        @Test
        void AVAILABLE이_아니면_예외() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.HOLD)
                    .build();

            assertThatThrownBy(() -> ss.hold(member, "token", 7))
                    .isInstanceOf(SeatException.class);
        }

        @Test
        void RESERVED에서는_HOLD_불가() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.RESERVED)
                    .build();

            assertThatThrownBy(() -> ss.hold(member, "token", 7))
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("releaseHold")
    class ReleaseHold {
        @Test
        void HOLD에서_해제_성공() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token", 7);

            ss.releaseHold();

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
            assertThat(ss.getHoldToken()).isNull();
            assertThat(ss.getHoldMember()).isNull();
            assertThat(ss.getHoldExpireAt()).isNull();
        }

        @Test
        void 이미_AVAILABLE이면_무시() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            ss.releaseHold();

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        }
    }

    @Nested
    @DisplayName("startPayment")
    class StartPayment {
        @Test
        void HOLD에서_PAYMENT_PENDING_전이() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.HOLD)
                    .build();

            ss.startPayment();

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.PAYMENT_PENDING);
        }

        @Test
        void AVAILABLE에서는_예외() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            assertThatThrownBy(() -> ss.startPayment())
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("reserve")
    class Reserve {
        @Test
        void PAYMENT_PENDING에서_RESERVED_전이() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.PAYMENT_PENDING)
                    .build();

            ss.reserve(member);

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.RESERVED);
            assertThat(ss.getReservedMember()).isEqualTo(member);
            assertThat(ss.getHoldToken()).isNull();
        }

        @Test
        void HOLD에서도_RESERVED_전이_가능() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token", 7);

            ss.reserve(member);

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.RESERVED);
        }

        @Test
        void AVAILABLE에서는_예외() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            assertThatThrownBy(() -> ss.reserve(member))
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("paymentFailed")
    class PaymentFailed {
        @Test
        void PAYMENT_PENDING에서_AVAILABLE_복귀() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.PAYMENT_PENDING)
                    .build();

            ss.paymentFailed();

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        }
    }

    @Nested
    @DisplayName("cancel")
    class Cancel {
        @Test
        void RESERVED에서_CANCELLED_전이() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.RESERVED)
                    .build();

            ss.cancel();

            assertThat(ss.getStatus()).isEqualTo(SeatStatus.CANCELLED);
        }

        @Test
        void AVAILABLE에서는_예외() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            assertThatThrownBy(() -> ss.cancel())
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("validateHoldToken")
    class ValidateHoldToken {
        @Test
        void 토큰_일치시_true() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token-abc", 7);

            assertThat(ss.validateHoldToken("token-abc")).isTrue();
            assertThat(ss.validateHoldToken("token-xyz")).isFalse();
        }

        @Test
        void validateHoldTokenOrThrow_불일치시_예외() {
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token-abc", 7);

            assertThatThrownBy(() -> ss.validateHoldTokenOrThrow("wrong"))
                    .isInstanceOf(SeatException.class);
        }
    }
}
