import { describe, it, expect } from 'vitest';
import { getErrorMessage, isNetworkError, isRetryableError } from '@/utils/errorHandler';

function createAxiosError(opts: {
  status?: number;
  message?: string;
  dataMessage?: string;
  code?: string;
  noResponse?: boolean;
}) {
  const error: Record<string, unknown> = {
    isAxiosError: true,
    message: opts.message ?? 'Request failed',
    code: opts.code,
  };
  if (!opts.noResponse && opts.status !== undefined) {
    error.response = {
      status: opts.status,
      data: opts.dataMessage ? { message: opts.dataMessage } : {},
    };
  }
  return error;
}

describe('getErrorMessage', () => {
  it('AxiosError의 서버 응답 메시지를 반환한다', () => {
    const err = createAxiosError({ status: 400, dataMessage: '유효하지 않은 이메일' });
    expect(getErrorMessage(err)).toBe('유효하지 않은 이메일');
  });

  it('400 상태에 메시지가 없으면 기본 메시지를 반환한다', () => {
    const err = createAxiosError({ status: 400 });
    expect(getErrorMessage(err)).toBe('잘못된 요청입니다.');
  });

  it('401 상태면 인증 메시지를 반환한다', () => {
    const err = createAxiosError({ status: 401 });
    expect(getErrorMessage(err)).toBe('인증이 필요합니다.');
  });

  it('403 상태면 권한 메시지를 반환한다', () => {
    const err = createAxiosError({ status: 403 });
    expect(getErrorMessage(err)).toBe('접근 권한이 없습니다.');
  });

  it('404 상태면 데이터 없음 메시지를 반환한다', () => {
    const err = createAxiosError({ status: 404 });
    expect(getErrorMessage(err)).toBe('요청한 데이터를 찾을 수 없습니다.');
  });

  it('500 상태면 서버 오류 메시지를 반환한다', () => {
    const err = createAxiosError({ status: 500 });
    expect(getErrorMessage(err)).toBe('서버 오류가 발생했습니다.');
  });

  it('일반 Error의 message를 반환한다', () => {
    expect(getErrorMessage(new Error('custom error'))).toBe('custom error');
  });

  it('unknown 에러에 기본 메시지를 반환한다', () => {
    expect(getErrorMessage('string error')).toBe('알 수 없는 오류가 발생했습니다.');
  });
});

describe('isNetworkError', () => {
  it('response 없고 ECONNABORTED가 아니면 true를 반환한다', () => {
    const err = createAxiosError({ noResponse: true, code: 'ERR_NETWORK' });
    expect(isNetworkError(err)).toBe(true);
  });

  it('response가 있으면 false를 반환한다', () => {
    const err = createAxiosError({ status: 500 });
    expect(isNetworkError(err)).toBe(false);
  });

  it('ECONNABORTED이면 false를 반환한다', () => {
    const err = createAxiosError({ noResponse: true, code: 'ECONNABORTED' });
    expect(isNetworkError(err)).toBe(false);
  });

  it('AxiosError가 아니면 false를 반환한다', () => {
    expect(isNetworkError(new Error('fail'))).toBe(false);
  });
});

describe('isRetryableError', () => {
  it('500 이상 상태면 true를 반환한다', () => {
    const err = createAxiosError({ status: 503 });
    expect(isRetryableError(err)).toBe(true);
  });

  it('네트워크 에러면 true를 반환한다', () => {
    const err = createAxiosError({ noResponse: true, code: 'ERR_NETWORK' });
    expect(isRetryableError(err)).toBe(true);
  });

  it('400대 에러면 false를 반환한다', () => {
    const err = createAxiosError({ status: 404 });
    expect(isRetryableError(err)).toBe(false);
  });
});
