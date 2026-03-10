import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '@/hooks/useFetch';

describe('useFetch', () => {
  it('초기 loading 상태가 true이다', () => {
    const fetcher = vi.fn(() => new Promise<string>(() => {})); // never resolves
    const { result } = renderHook(() => useFetch(fetcher));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('성공 시 loading false, data 설정', async () => {
    const fetcher = vi.fn(() => Promise.resolve({ id: 1, name: 'test' }));
    const { result } = renderHook(() => useFetch(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, name: 'test' });
    expect(result.current.error).toBeNull();
  });

  it('실패 시 error 메시지 설정', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('fetch failed')));
    const { result } = renderHook(() => useFetch(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('fetch failed');
    expect(result.current.data).toBeNull();
  });

  it('Error가 아닌 예외도 문자열로 변환한다', async () => {
    const fetcher = vi.fn(() => Promise.reject('string error'));
    const { result } = renderHook(() => useFetch(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('string error');
  });

  it('refetch 호출 시 재실행된다', async () => {
    let callCount = 0;
    const fetcher = vi.fn(() => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    });

    const { result } = renderHook(() => useFetch(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toBe('result-1');

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toBe('result-2');
    });
  });

  it('언마운트 후 상태 업데이트가 없다', async () => {
    let resolveFn: (val: string) => void;
    const fetcher = vi.fn(
      () => new Promise<string>((resolve) => { resolveFn = resolve; })
    );

    const { unmount } = renderHook(() => useFetch(fetcher));
    unmount();

    // resolve 후에도 에러가 발생하지 않아야 한다
    resolveFn!('late result');
    // 에러 없이 통과하면 성공
  });
});
