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
            // given: AVAILABLE 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            // when: hold(회원, 토큰, 만료분) 호출
            ss.hold(member, "token-123", 7);

            // then: 상태 HOLD, 토큰·회원·만료시각 설정됨
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.HOLD);
            assertThat(ss.getHoldToken()).isEqualTo("token-123");
            assertThat(ss.getHoldMember()).isEqualTo(member);
            assertThat(ss.getHoldExpireAt()).isNotNull();
        }

        @Test
        void AVAILABLE이_아니면_예외() {
            // given: 이미 HOLD 상태인 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.HOLD)
                    .build();

            // when & then: hold 호출 시 SeatException 발생
            assertThatThrownBy(() -> ss.hold(member, "token", 7))
                    .isInstanceOf(SeatException.class);
        }

        @Test
        void RESERVED에서는_HOLD_불가() {
            // given: RESERVED 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.RESERVED)
                    .build();

            // when & then: hold 호출 시 SeatException 발생
            assertThatThrownBy(() -> ss.hold(member, "token", 7))
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("releaseHold")
    class ReleaseHold {
        @Test
        void HOLD에서_해제_성공() {
            // given: HOLD 상태인 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token", 7);

            // when: releaseHold 호출
            ss.releaseHold();

            // then: AVAILABLE로 복귀, hold 관련 필드 null
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
            assertThat(ss.getHoldToken()).isNull();
            assertThat(ss.getHoldMember()).isNull();
            assertThat(ss.getHoldExpireAt()).isNull();
        }

        @Test
        void 이미_AVAILABLE이면_무시() {
            // given: AVAILABLE 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            // when: releaseHold 호출
            ss.releaseHold();

            // then: 상태 변경 없이 AVAILABLE 유지
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        }
    }

    @Nested
    @DisplayName("startPayment")
    class StartPayment {
        @Test
        void HOLD에서_PAYMENT_PENDING_전이() {
            // given: HOLD 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.HOLD)
                    .build();

            // when: startPayment 호출
            ss.startPayment();

            // then: 상태가 PAYMENT_PENDING으로 변경
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.PAYMENT_PENDING);
        }

        @Test
        void AVAILABLE에서는_예외() {
            // given: AVAILABLE 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            // when & then: startPayment 호출 시 SeatException 발생
            assertThatThrownBy(() -> ss.startPayment())
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("reserve")
    class Reserve {
        @Test
        void PAYMENT_PENDING에서_RESERVED_전이() {
            // given: PAYMENT_PENDING 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.PAYMENT_PENDING)
                    .build();

            // when: reserve(회원) 호출
            ss.reserve(member);

            // then: RESERVED로 전이, 예매 회원 설정, hold 토큰 제거
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.RESERVED);
            assertThat(ss.getReservedMember()).isEqualTo(member);
            assertThat(ss.getHoldToken()).isNull();
        }

        @Test
        void HOLD에서도_RESERVED_전이_가능() {
            // given: HOLD 상태인 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token", 7);

            // when: reserve(회원) 호출
            ss.reserve(member);

            // then: RESERVED로 전이
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.RESERVED);
        }

        @Test
        void AVAILABLE에서는_예외() {
            // given: AVAILABLE 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            // when & then: reserve 호출 시 SeatException 발생
            assertThatThrownBy(() -> ss.reserve(member))
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("paymentFailed")
    class PaymentFailed {
        @Test
        void PAYMENT_PENDING에서_AVAILABLE_복귀() {
            // given: PAYMENT_PENDING 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.PAYMENT_PENDING)
                    .build();

            // when: paymentFailed 호출
            ss.paymentFailed();

            // then: AVAILABLE로 복귀
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        }
    }

    @Nested
    @DisplayName("cancel")
    class Cancel {
        @Test
        void RESERVED에서_CANCELLED_전이() {
            // given: RESERVED 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.RESERVED)
                    .build();

            // when: cancel 호출
            ss.cancel();

            // then: CANCELLED로 전이
            assertThat(ss.getStatus()).isEqualTo(SeatStatus.CANCELLED);
        }

        @Test
        void AVAILABLE에서는_예외() {
            // given: AVAILABLE 상태의 ScreeningSeat 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();

            // when & then: cancel 호출 시 SeatException 발생
            assertThatThrownBy(() -> ss.cancel())
                    .isInstanceOf(SeatException.class);
        }
    }

    @Nested
    @DisplayName("validateHoldToken")
    class ValidateHoldToken {
        @Test
        void 토큰_일치시_true() {
            // given: HOLD 상태의 ScreeningSeat(토큰 token-abc) 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token-abc", 7);

            // when: validateHoldToken으로 일치/불일치 토큰 검사
            // then: 일치 시 true, 불일치 시 false
            assertThat(ss.validateHoldToken("token-abc")).isTrue();
            assertThat(ss.validateHoldToken("token-xyz")).isFalse();
        }

        @Test
        void validateHoldTokenOrThrow_불일치시_예외() {
            // given: HOLD 상태의 ScreeningSeat(토큰 token-abc) 준비
            ScreeningSeat ss = ScreeningSeat.builder()
                    .screening(screening)
                    .seat(seat)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            ss.hold(member, "token-abc", 7);

            // when & then: 잘못된 토큰으로 validateHoldTokenOrThrow 호출 시 SeatException 발생
            assertThatThrownBy(() -> ss.validateHoldTokenOrThrow("wrong"))
                    .isInstanceOf(SeatException.class);
        }
    }
}
