import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  status?: number;
}

function isAxiosError(error: any): error is AxiosError {
  return error && (error.isAxiosError === true);
}

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    // 서버 응답 메시지 확인
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    if (responseData?.message) {
      return responseData.message;
    }

    // HTTP 상태별 기본 메시지
    switch (error.response?.status) {
      case 400: return '잘못된 요청입니다.';
      case 401: return '인증이 필요합니다.';
      case 403: return '접근 권한이 없습니다.';
      case 404: return '요청한 데이터를 찾을 수 없습니다.';
      case 500: return '서버 오류가 발생했습니다.';
      default: return error.message || '알 수 없는 오류가 발생했습니다.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

export const isNetworkError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
};

export const isRetryableError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    // 5xx 에러 또는 네트워크 에러
    const status = error.response?.status;
    return (status && status >= 500) || isNetworkError(error);
  }
  return false;
};
