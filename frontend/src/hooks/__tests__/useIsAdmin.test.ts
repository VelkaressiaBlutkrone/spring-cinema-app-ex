import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuthStore } from '@/stores/authStore';

function createTestJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.test-sig`;
}

describe('useIsAdmin', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: false });
  });

  it('ADMIN 토큰이면 true를 반환한다', () => {
    const token = createTestJwt({ role: 'ADMIN' });
    useAuthStore.setState({ accessToken: token, isAuthenticated: true });

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(true);
  });

  it('USER 토큰이면 false를 반환한다', () => {
    const token = createTestJwt({ role: 'USER' });
    useAuthStore.setState({ accessToken: token, isAuthenticated: true });

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });

  it('null 토큰이면 false를 반환한다', () => {
    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });
});
