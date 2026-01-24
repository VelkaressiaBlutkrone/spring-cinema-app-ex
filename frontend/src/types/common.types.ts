// API 응답 기본 구조
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API 에러 응답
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  error: string;
  message: string;
}

// 페이지 정보
export interface PaginationParams {
  page: number;
  size: number;
}

// 정렬 정보
export interface SortParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
