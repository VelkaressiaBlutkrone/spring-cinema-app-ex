/**
 * 영화관 예매 - 영화/상영 도메인 타입
 * 백엔드 MovieResponse, ScreeningResponse와 맞춤
 */

export type MovieStatus = 'RELEASED' | 'UPCOMING' | 'ENDED' | 'DELETED';

export interface Movie {
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
  status: MovieStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type ScreeningStatus = 'SCHEDULED' | 'NOW_SHOWING' | 'ONGOING' | 'ENDED' | 'CANCELLED';

export interface Screening {
  id: number;
  movieId: number;
  movieTitle: string;
  screenId: number;
  screenName: string;
  theaterName?: string;
  startTime: string;
  endTime: string;
  status: ScreeningStatus;
  createdAt?: string;
  updatedAt?: string;
}

/** 상영 상태 라벨 (표시용) */
export const SCREENING_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: '상영 예정',
  NOW_SHOWING: '상영 중',
  ONGOING: '상영 중',
  ENDED: '상영 종료',
  CANCELLED: '상영 취소',
};
