/**
 * 예매/결제 도메인 타입
 * 백엔드 PaymentRequest, PaymentResponse, ReservationDetailResponse 등과 맞춤
 */

export type PaymentMethod = 'CARD' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS' | 'BANK_TRANSFER';

export interface SeatHoldItem {
  seatId: number;
  holdToken: string;
}

export interface PaymentRequest {
  screeningId: number;
  seatHoldItems: SeatHoldItem[];
  payMethod: PaymentMethod;
}

export interface PaymentResponse {
  reservationId: number;
  reservationNo: string;
  screeningId: number;
  totalSeats: number;
  totalAmount: number;
}

export interface ReservationSeatItem {
  seatId: number;
  rowLabel: string;
  seatNo: number;
  displayName: string;
  price: number;
}

/** 결제 요약 (마이페이지·예매 내역용) */
export interface PaymentSummary {
  paymentId: number;
  paymentNo: string;
  payStatus: string;
  payMethod: PaymentMethod;
  payAmount: number;
  paidAt: string | null;
}

export interface ReservationDetailResponse {
  reservationId: number;
  reservationNo: string;
  status: string;
  memberId: number;
  screeningId: number;
  movieTitle: string;
  screenName: string;
  startTime: string;
  totalSeats: number;
  totalAmount: number;
  seats: ReservationSeatItem[];
  createdAt: string;
  payment?: PaymentSummary | null;
}
