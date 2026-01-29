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

/**
 * 백엔드 PageResponse DTO 구조 (Gson 직렬화용).
 * page(0-based) 사용, number 대신 page 필드.
 */
export interface PageResponseBody<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** 목록 API 응답: Spring Page(number) 또는 PageResponse(page) 모두 처리 */
export function getPageIndex(data: SpringPage<unknown> | PageResponseBody<unknown>): number {
  const d = data as Record<string, unknown>;
  if (typeof d.page === 'number') return d.page;
  if (typeof d.number === 'number') return d.number;
  return 0;
}
