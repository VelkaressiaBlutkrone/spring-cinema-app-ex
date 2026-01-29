/**
 * 예매/결제 API
 * POST /api/reservations/pay, GET /api/reservations, GET /api/reservations/{id}
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody } from '@/types/api.types';
import type {
  PaymentRequest,
  PaymentResponse,
  ReservationDetailResponse,
} from '@/types/reservation.types';

const BASE = '/reservations';

export const reservationsApi = {
  /** 결제(예매) 요청 (인증 필요) */
  pay: async (body: PaymentRequest) => {
    const { data } = await axiosInstance.post<ApiResponseBody<PaymentResponse>>(
      `${BASE}/pay`,
      body
    );
    return data;
  },

  /** 본인 예매 목록 */
  getMyReservations: async () => {
    const { data } = await axiosInstance.get<ApiResponseBody<ReservationDetailResponse[]>>(BASE);
    return data;
  },

  /** 예매 상세 */
  getReservationDetail: async (reservationId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<ReservationDetailResponse>>(
      `${BASE}/${reservationId}`
    );
    return data;
  },

  /** 예매 취소 */
  cancelReservation: async (reservationId: number) => {
    await axiosInstance.post(`${BASE}/${reservationId}/cancel`);
  },
};
