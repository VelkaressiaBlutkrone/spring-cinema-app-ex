/**
 * 좌석/예매 도메인 타입
 * 백엔드 SeatStatus, SeatStatusItem, SeatLayoutResponse, SeatHoldResponse 등과 맞춤
 */

export type SeatStatus =
  | 'AVAILABLE'
  | 'HOLD'
  | 'PAYMENT_PENDING'
  | 'RESERVED'
  | 'CANCELLED'
  | 'BLOCKED'
  | 'DISABLED';

export interface SeatStatusItem {
  seatId: number;
  status: SeatStatus;
  rowLabel: string;
  seatNo: number;
  holdExpireAt?: string; // ISO string, HOLD인 경우 서버 기준 만료 시각
  /** 현재 사용자 소유 HOLD일 때만 API가 내려줌 (재진입 시 취소용) */
  holdToken?: string;
  /** 현재 사용자 소유 HOLD 여부 */
  isHeldByCurrentUser?: boolean;
}

export interface SeatLayoutResponse {
  screeningId: number;
  seats: SeatStatusItem[];
}

export interface SeatHoldResponse {
  holdToken: string;
  screeningId: number;
  seatId: number;
  holdExpireAt: string; // ISO
  ttlSeconds: number; // 남은 초 (클라이언트 타이머용)
}

export interface SeatReleaseRequest {
  screeningId: number;
  seatId: number;
  holdToken: string;
}

/** SSE 이벤트 payload: seat-status-changed */
export interface SeatStatusChangedEvent {
  eventId: string;
  screeningId: number;
  seatIds: number[];
}
