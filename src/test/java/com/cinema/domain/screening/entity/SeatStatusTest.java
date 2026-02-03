package com.cinema.domain.screening.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("SeatStatus 단위 테스트")
class SeatStatusTest {

    @Nested
    @DisplayName("canHold")
    class CanHold {
        @Test
        void AVAILABLE은_HOLD_가능() {
            // given: SeatStatus.AVAILABLE
            // when: canHold() 호출
            // then: true 반환
            assertThat(SeatStatus.AVAILABLE.canHold()).isTrue();
        }

        @Test
        void AVAILABLE이_아니면_HOLD_불가() {
            // given: HOLD, RESERVED, BLOCKED 상태
            // when: canHold() 호출
            // then: false 반환
            assertThat(SeatStatus.HOLD.canHold()).isFalse();
            assertThat(SeatStatus.RESERVED.canHold()).isFalse();
            assertThat(SeatStatus.BLOCKED.canHold()).isFalse();
        }
    }

    @Nested
    @DisplayName("canPay")
    class CanPay {
        @Test
        void HOLD는_결제_가능() {
            // given: SeatStatus.HOLD
            // when: canPay() 호출
            // then: true 반환
            assertThat(SeatStatus.HOLD.canPay()).isTrue();
        }

        @Test
        void HOLD가_아니면_결제_불가() {
            // given: AVAILABLE, RESERVED 상태
            // when: canPay() 호출
            // then: false 반환
            assertThat(SeatStatus.AVAILABLE.canPay()).isFalse();
            assertThat(SeatStatus.RESERVED.canPay()).isFalse();
        }
    }

    @Nested
    @DisplayName("canCancel")
    class CanCancel {
        @Test
        void RESERVED는_취소_가능() {
            // given: SeatStatus.RESERVED
            // when: canCancel() 호출
            // then: true 반환
            assertThat(SeatStatus.RESERVED.canCancel()).isTrue();
        }

        @Test
        void RESERVED가_아니면_취소_불가() {
            // given: AVAILABLE, HOLD 상태
            // when: canCancel() 호출
            // then: false 반환
            assertThat(SeatStatus.AVAILABLE.canCancel()).isFalse();
            assertThat(SeatStatus.HOLD.canCancel()).isFalse();
        }
    }

    @Nested
    @DisplayName("isSelectable")
    class IsSelectable {
        @Test
        void AVAILABLE만_선택_가능() {
            // given: AVAILABLE, HOLD, RESERVED 상태
            // when: isSelectable() 호출
            // then: AVAILABLE만 true, 나머지 false
            assertThat(SeatStatus.AVAILABLE.isSelectable()).isTrue();
            assertThat(SeatStatus.HOLD.isSelectable()).isFalse();
            assertThat(SeatStatus.RESERVED.isSelectable()).isFalse();
        }
    }

    @Nested
    @DisplayName("isOccupied")
    class IsOccupied {
        @Test
        void HOLD_PAYMENT_PENDING_RESERVED는_점유_상태() {
            // given: HOLD, PAYMENT_PENDING, RESERVED 상태
            // when: isOccupied() 호출
            // then: true 반환
            assertThat(SeatStatus.HOLD.isOccupied()).isTrue();
            assertThat(SeatStatus.PAYMENT_PENDING.isOccupied()).isTrue();
            assertThat(SeatStatus.RESERVED.isOccupied()).isTrue();
        }

        @Test
        void AVAILABLE_CANCELLED는_미점유() {
            // given: AVAILABLE, CANCELLED, BLOCKED 상태
            // when: isOccupied() 호출
            // then: false 반환
            assertThat(SeatStatus.AVAILABLE.isOccupied()).isFalse();
            assertThat(SeatStatus.CANCELLED.isOccupied()).isFalse();
            assertThat(SeatStatus.BLOCKED.isOccupied()).isFalse();
        }
    }
}
