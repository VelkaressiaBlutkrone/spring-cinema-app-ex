/**
 * 관리자 API용 타입 (백엔드 Admin DTO/Enum과 동일)
 */

// ----- Movie -----
export type AdminMovieStatus = 'SHOWING' | 'COMING_SOON' | 'ENDED';

export interface AdminMovieResponse {
  id: number;
  title: string;
  description?: string;
  runningTime?: number;
  rating?: string;
  genre?: string;
  director?: string;
  actors?: string;
  posterUrl?: string;
  releaseDate?: string;
  status: AdminMovieStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminMovieCreateRequest {
  title: string;
  description?: string;
  runningTime: number;
  rating?: string;
  genre?: string;
  director?: string;
  actors?: string;
  posterUrl?: string;
  releaseDate?: string;
}

export interface AdminMovieUpdateRequest {
  title: string;
  description?: string;
  runningTime?: number;
  rating?: string;
  genre?: string;
  director?: string;
  actors?: string;
  posterUrl?: string;
}

// ----- Theater -----
export type AdminTheaterStatus = 'OPEN' | 'CLOSED' | 'MAINTENANCE';

export interface AdminTheaterResponse {
  id: number;
  name: string;
  location?: string;
  address?: string;
  phone?: string;
  status: AdminTheaterStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTheaterCreateRequest {
  name: string;
  location?: string;
  address?: string;
  phone?: string;
}

export interface AdminTheaterUpdateRequest {
  name: string;
  location?: string;
  address?: string;
  phone?: string;
}

// ----- Screen -----
export type AdminScreenType = 'NORMAL_2D' | 'NORMAL_3D' | 'IMAX' | 'DX_4D' | 'SCREEN_X';
export type AdminScreenStatus = 'OPEN' | 'CLOSED' | 'MAINTENANCE';

export interface AdminScreenResponse {
  id: number;
  theaterId: number;
  theaterName: string;
  name: string;
  totalRows: number;
  totalCols: number;
  totalSeats: number;
  screenType: AdminScreenType;
  status: AdminScreenStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminScreenCreateRequest {
  theaterId: number;
  name: string;
  totalRows: number;
  totalCols: number;
  screenType: AdminScreenType;
}

export interface AdminScreenUpdateRequest {
  name: string;
  totalRows?: number;
  totalCols?: number;
  screenType?: AdminScreenType;
}

// ----- Screening -----
export type AdminScreeningStatus = 'SCHEDULED' | 'NOW_SHOWING' | 'ENDED' | 'CANCELLED';

export interface AdminScreeningResponse {
  id: number;
  movieId: number;
  movieTitle: string;
  screenId: number;
  screenName: string;
  startTime: string;
  endTime: string;
  status: AdminScreeningStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminScreeningCreateRequest {
  movieId: number;
  screenId: number;
  startTime: string; // ISO 8601
}

export interface AdminScreeningUpdateRequest {
  movieId: number;
  screenId: number;
  startTime: string;
}

// ----- Seat -----
export type AdminSeatType = 'NORMAL' | 'PREMIUM' | 'VIP' | 'COUPLE' | 'WHEELCHAIR';
export type AdminSeatBaseStatus = 'AVAILABLE' | 'BLOCKED' | 'DISABLED';

export interface AdminSeatResponse {
  id: number;
  screenId: number;
  screenName: string;
  rowLabel: string;
  seatNo: number;
  displayName: string;
  seatType: AdminSeatType;
  baseStatus: AdminSeatBaseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSeatCreateRequest {
  screenId: number;
  rowLabel: string;
  seatNo: number;
  seatType: AdminSeatType;
}

export interface AdminSeatUpdateRequest {
  seatType?: AdminSeatType;
  baseStatus: AdminSeatBaseStatus;
}

// ----- Reservation -----
export type AdminReservationStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface AdminReservationListResponse {
  reservationId: number;
  reservationNo: string;
  status: AdminReservationStatus;
  memberId: number;
  memberLoginId: string;
  screeningId: number;
  movieTitle: string;
  screenName: string;
  startTime: string;
  totalSeats: number;
  totalAmount: number;
  createdAt: string;
}

// ----- Payment -----
export type AdminPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type AdminPaymentMethod = 'CARD' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS' | 'BANK_TRANSFER';

export interface AdminPaymentListResponse {
  paymentId: number;
  paymentNo: string;
  payStatus: AdminPaymentStatus;
  payMethod: AdminPaymentMethod;
  payAmount: number;
  reservationId: number;
  reservationNo: string;
  memberId: number;
  memberLoginId: string;
  movieTitle: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt: string;
}
