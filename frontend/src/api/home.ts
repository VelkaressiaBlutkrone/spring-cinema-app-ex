/**
 * 메인 화면 홈 API (Step 10)
 * GET /api/home/stats, GET /api/home/upcoming-movies
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody } from '@/types/api.types';

export interface HomeStatsResponse {
  theaterCount: number;
  screenCount: number;
  todayScreeningCount: number;
}

export interface UpcomingMovieItem {
  id: number;
  title: string;
}

export const homeApi = {
  /** 영화관/상영관 현황 요약 */
  getStats: async () => {
    const { data } = await axiosInstance.get<ApiResponseBody<HomeStatsResponse>>('/home/stats');
    return data;
  },

  /** 현재 일자 기준 days일 이내 상영 예정 영화 목록 */
  getUpcomingMovies: async (days = 3) => {
    const { data } = await axiosInstance.get<ApiResponseBody<UpcomingMovieItem[]>>(
      '/home/upcoming-movies',
      { params: { days } }
    );
    return data;
  },
};
