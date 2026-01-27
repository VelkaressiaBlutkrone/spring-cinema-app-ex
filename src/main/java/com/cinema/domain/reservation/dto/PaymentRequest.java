package com.cinema.domain.reservation.dto;

import java.util.List;

import com.cinema.domain.payment.entity.PaymentMethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 결제(예매) 요청 DTO (Step 7)
 * 가격은 서버에서만 계산하며, 클라이언트 금액은 사용하지 않음.
 */
@Getter
@Setter
@NoArgsConstructor
public class PaymentRequest {

    @NotNull(message = "상영 ID는 필수입니다.")
    private Long screeningId;

    @NotEmpty(message = "좌석 HOLD 목록은 필수입니다.")
    @Valid
    private List<SeatHoldItem> seatHoldItems;

    @NotNull(message = "결제 수단은 필수입니다.")
    private PaymentMethod payMethod;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class SeatHoldItem {
        @NotNull(message = "좌석 ID는 필수입니다.")
        private Long seatId;
        @NotNull(message = "HOLD Token은 필수입니다.")
        private String holdToken;

        public SeatHoldItem(Long seatId, String holdToken) {
            this.seatId = seatId;
            this.holdToken = holdToken;
        }
    }
}
