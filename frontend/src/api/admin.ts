/**
 * 관리자 API (영화/영화관/상영관/상영 스케줄)
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody, SpringPage, PageResponseBody } from '@/types/api.types';
import type { PaginationParams } from '@/types/common.types';
import type {
  AdminMovieResponse,
  AdminMovieCreateRequest,
  AdminMovieUpdateRequest,
  AdminTheaterResponse,
  AdminTheaterCreateRequest,
  AdminTheaterUpdateRequest,
  AdminScreenResponse,
  AdminScreenCreateRequest,
  AdminScreenUpdateRequest,
  AdminScreeningResponse,
  AdminScreeningCreateRequest,
  AdminScreeningUpdateRequest,
  AdminSeatResponse,
  AdminSeatCreateRequest,
  AdminSeatUpdateRequest,
  AdminReservationListResponse,
  AdminPaymentListResponse,
} from '@/types/admin.types';
import type { ReservationDetailResponse } from '@/types/reservation.types';

const prefix = '/admin';

/** 목록 응답: 백엔드가 PageResponse DTO 사용 (content, page, totalElements 등) */
type AdminPageData<T> = SpringPage<T> | PageResponseBody<T>;

/** 영화 관리 */
export const adminMoviesApi = {
  getList: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminPageData<AdminMovieResponse>>>(
      `${prefix}/movies`,
      { params: params ? { page: params.page, size: params.size } : undefined }
    );
    return data;
  },
  getOne: async (movieId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminMovieResponse>>(
      `${prefix}/movies/${movieId}`
    );
    return data;
  },
  create: async (body: AdminMovieCreateRequest) => {
    const { data } = await axiosInstance.post<ApiResponseBody<number>>(`${prefix}/movies`, body);
    return data;
  },
  update: async (movieId: number, body: AdminMovieUpdateRequest) => {
    const { data } = await axiosInstance.put<ApiResponseBody<null>>(
      `${prefix}/movies/${movieId}`,
      body
    );
    return data;
  },
  delete: async (movieId: number) => {
    const { data } = await axiosInstance.delete<ApiResponseBody<null>>(
      `${prefix}/movies/${movieId}`
    );
    return data;
  },
};

/** 영화관 관리 */
export const adminTheatersApi = {
  getList: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminPageData<AdminTheaterResponse>>>(
      `${prefix}/theaters`,
      { params: params ? { page: params.page, size: params.size } : undefined }
    );
    return data;
  },
  getOne: async (theaterId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminTheaterResponse>>(
      `${prefix}/theaters/${theaterId}`
    );
    return data;
  },
  create: async (body: AdminTheaterCreateRequest) => {
    const { data } = await axiosInstance.post<ApiResponseBody<number>>(
      `${prefix}/theaters`,
      body
    );
    return data;
  },
  update: async (theaterId: number, body: AdminTheaterUpdateRequest) => {
    const { data } = await axiosInstance.put<ApiResponseBody<null>>(
      `${prefix}/theaters/${theaterId}`,
      body
    );
    return data;
  },
  delete: async (theaterId: number) => {
    const { data } = await axiosInstance.delete<ApiResponseBody<null>>(
      `${prefix}/theaters/${theaterId}`
    );
    return data;
  },
};

/** 상영관 관리 */
export const adminScreensApi = {
  getList: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminPageData<AdminScreenResponse>>>(
      `${prefix}/screens`,
      { params: params ? { page: params.page, size: params.size } : undefined }
    );
    return data;
  },
  getOne: async (screenId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminScreenResponse>>(
      `${prefix}/screens/${screenId}`
    );
    return data;
  },
  getByTheater: async (theaterId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminScreenResponse[]>>(
      `${prefix}/screens/by-theater`,
      { params: { theaterId } }
    );
    return data;
  },
  create: async (body: AdminScreenCreateRequest) => {
    const { data } = await axiosInstance.post<ApiResponseBody<number>>(
      `${prefix}/screens`,
      body
    );
    return data;
  },
  update: async (screenId: number, body: AdminScreenUpdateRequest) => {
    const { data } = await axiosInstance.put<ApiResponseBody<null>>(
      `${prefix}/screens/${screenId}`,
      body
    );
    return data;
  },
  delete: async (screenId: number) => {
    const { data } = await axiosInstance.delete<ApiResponseBody<null>>(
      `${prefix}/screens/${screenId}`
    );
    return data;
  },
};

/** 상영 스케줄 관리 */
export const adminScreeningsApi = {
  getList: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponseBody<AdminPageData<AdminScreeningResponse>>
    >(`${prefix}/screenings`, {
      params: params ? { page: params.page, size: params.size } : undefined,
    });
    return data;
  },
  getOne: async (screeningId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminScreeningResponse>>(
      `${prefix}/screenings/${screeningId}`
    );
    return data;
  },
  getByMovie: async (movieId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminScreeningResponse[]>>(
      `${prefix}/screenings/by-movie`,
      { params: { movieId } }
    );
    return data;
  },
  getByScreen: async (screenId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminScreeningResponse[]>>(
      `${prefix}/screenings/by-screen`,
      { params: { screenId } }
    );
    return data;
  },
  create: async (body: AdminScreeningCreateRequest) => {
    const { data } = await axiosInstance.post<ApiResponseBody<number>>(
      `${prefix}/screenings`,
      body
    );
    return data;
  },
  update: async (screeningId: number, body: AdminScreeningUpdateRequest) => {
    const { data } = await axiosInstance.put<ApiResponseBody<null>>(
      `${prefix}/screenings/${screeningId}`,
      body
    );
    return data;
  },
  delete: async (screeningId: number) => {
    const { data } = await axiosInstance.delete<ApiResponseBody<null>>(
      `${prefix}/screenings/${screeningId}`
    );
    return data;
  },
};

/** 좌석 관리 */
export const adminSeatsApi = {
  getList: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminPageData<AdminSeatResponse>>>(
      `${prefix}/seats`,
      { params: params ? { page: params.page, size: params.size } : undefined }
    );
    return data;
  },
  getOne: async (seatId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminSeatResponse>>(
      `${prefix}/seats/${seatId}`
    );
    return data;
  },
  getByScreen: async (screenId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminSeatResponse[]>>(
      `${prefix}/seats/by-screen`,
      { params: { screenId } }
    );
    return data;
  },
  create: async (body: AdminSeatCreateRequest) => {
    const { data } = await axiosInstance.post<ApiResponseBody<number>>(
      `${prefix}/seats`,
      body
    );
    return data;
  },
  update: async (seatId: number, body: AdminSeatUpdateRequest) => {
    const { data } = await axiosInstance.put<ApiResponseBody<null>>(
      `${prefix}/seats/${seatId}`,
      body
    );
    return data;
  },
  delete: async (seatId: number) => {
    const { data } = await axiosInstance.delete<ApiResponseBody<null>>(
      `${prefix}/seats/${seatId}`
    );
    return data;
  },
};

/** 예매 관리 */
export const adminReservationsApi = {
  getList: async (params?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    movieId?: number;
    memberId?: number;
    status?: string;
  }) => {
    const { data } = await axiosInstance.get<
      ApiResponseBody<AdminPageData<AdminReservationListResponse>>
    >(`${prefix}/reservations`, { params });
    return data;
  },
  getOne: async (reservationId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<ReservationDetailResponse>>(
      `${prefix}/reservations/${reservationId}`
    );
    return data;
  },
  getCancelled: async (params?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const { data } = await axiosInstance.get<
      ApiResponseBody<AdminPageData<AdminReservationListResponse>>
    >(`${prefix}/reservations/cancelled`, { params });
    return data;
  },
};

/** 결제 관리 */
export const adminPaymentsApi = {
  getList: async (params?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    payStatus?: string;
    memberId?: number;
  }) => {
    const { data } = await axiosInstance.get<
      ApiResponseBody<AdminPageData<AdminPaymentListResponse>>
    >(`${prefix}/payments`, { params });
    return data;
  },
  getOne: async (paymentId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<AdminPaymentListResponse>>(
      `${prefix}/payments/${paymentId}`
    );
    return data;
  },
  getCancelled: async (params?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const { data } = await axiosInstance.get<
      ApiResponseBody<AdminPageData<AdminPaymentListResponse>>
    >(`${prefix}/payments/cancelled`, { params });
    return data;
  },
};
