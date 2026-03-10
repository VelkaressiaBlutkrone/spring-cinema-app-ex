import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    useAuthStore.setState({ accessToken: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('초기 상태: accessToken null, isAuthenticated false', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setTokens: 토큰 설정 시 isAuthenticated true, localStorage에 저장', () => {
    useAuthStore.getState().setTokens('test-token');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('test-token');
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('test-token');
  });

  it('setAccessToken: setTokens와 동일하게 동작한다', () => {
    useAuthStore.getState().setAccessToken('another-token');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('another-token');
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('another-token');
  });

  it('clearAuth: 토큰 제거 및 isAuthenticated false', () => {
    useAuthStore.getState().setTokens('test-token');
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('getAccessToken: 현재 토큰을 반환한다', () => {
    useAuthStore.getState().setTokens('my-token');
    expect(useAuthStore.getState().getAccessToken()).toBe('my-token');
  });

  it('getRefreshToken: 항상 null을 반환한다', () => {
    expect(useAuthStore.getState().getRefreshToken()).toBeNull();
  });

  it('빈 문자열 전달 시 상태를 변경하지 않는다', () => {
    useAuthStore.getState().setTokens('');
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
