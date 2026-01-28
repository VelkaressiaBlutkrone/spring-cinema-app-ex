/**
 * 좌석 배치 / HOLD / 해제 API
 * GET /api/screenings/{screeningId}/seats, POST hold, POST holds/release
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody } from '@/types/api.types';
import type {
  SeatLayoutResponse,
  SeatHoldResponse,
  SeatReleaseRequest,
} from '@/types/seat.types';

export const seatsApi = {
  /** 좌석 배치·상태 조회 (Redis 캐시, DB Fallback) */
  getSeatLayout: async (screeningId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<SeatLayoutResponse>>(
      `/screenings/${screeningId}/seats`
    );
    return data;
  },

  /** 좌석 HOLD (인증 필요) */
  holdSeat: async (screeningId: number, seatId: number) => {
    const { data } = await axiosInstance.post<ApiResponseBody<SeatHoldResponse>>(
      `/screenings/${screeningId}/seats/${seatId}/hold`
    );
    return data;
  },

  /** 좌석 HOLD 해제 */
  releaseHold: async (body: SeatReleaseRequest) => {
    await axiosInstance.post('/screenings/holds/release', body);
  },
};
