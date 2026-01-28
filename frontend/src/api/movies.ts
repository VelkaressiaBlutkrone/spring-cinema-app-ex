/**
 * 사용자용 영화/상영 API
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody, SpringPage } from '@/types/api.types';
import type { Movie, Screening } from '@/types/movie.types';
import type { PaginationParams } from '@/types/common.types';

export const moviesApi = {
  /** 영화 목록 (페이징) */
  getMovies: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<ApiResponseBody<SpringPage<Movie>>>('/movies', {
      params: params ? { page: params.page, size: params.size } : undefined,
    });
    return data;
  },

  /** 영화 상세 */
  getMovie: async (movieId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<Movie>>(`/movies/${movieId}`);
    return data;
  },
};

export const screeningsApi = {
  /** 상영 목록 (페이징) */
  getScreenings: async (params?: PaginationParams) => {
    const { data } = await axiosInstance.get<ApiResponseBody<SpringPage<Screening>>>('/screenings', {
      params: params ? { page: params.page, size: params.size } : undefined,
    });
    return data;
  },

  /** 특정 영화의 상영 스케줄 */
  getScreeningsByMovie: async (movieId: number) => {
    const { data } = await axiosInstance.get<ApiResponseBody<Screening[]>>('/screenings/by-movie', {
      params: { movieId },
    });
    return data;
  },
};
