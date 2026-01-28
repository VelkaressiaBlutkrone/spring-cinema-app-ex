/**
 * 인증 상태 스토어 (Zustand)
 * Access/Refresh Token 저장, 로그인/로그아웃 상태
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: (access, refresh) => {
        localStorage.setItem(ACCESS_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'cinema-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

/** localStorage와 동기화하여 axios에서 사용할 수 있게 함 */
export const syncTokensToStorage = () => {
  const { accessToken, refreshToken } = useAuthStore.getState();
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  else localStorage.removeItem(ACCESS_KEY);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  else localStorage.removeItem(REFRESH_KEY);
};
