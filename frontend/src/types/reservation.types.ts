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
}
