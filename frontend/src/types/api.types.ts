/**
 * 백엔드 API 응답 구조
 * Spring ApiResponse, Page 구조에 맞춤
 */

export interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Spring Data Page<T> 구조 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
