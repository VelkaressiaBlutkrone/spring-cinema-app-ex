/**
 * 인증 상태 스토어 (Zustand)
 * - Access Token만 저장 (Refresh Token은 HttpOnly Cookie)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ACCESS_KEY = 'accessToken';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string) => void;
  setAccessToken: (access: string) => void;
  clearAuth: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isAuthenticated: false,
      setTokens: (access) => {
        if (access) {
          localStorage.setItem(ACCESS_KEY, access);
          set({ accessToken: access, isAuthenticated: true });
        }
      },
      setAccessToken: (access) => {
        if (access) {
          localStorage.setItem(ACCESS_KEY, access);
          set({ accessToken: access, isAuthenticated: true });
        }
      },
      clearAuth: () => {
        localStorage.removeItem(ACCESS_KEY);
        set({ accessToken: null, isAuthenticated: false });
      },
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => null,
    }),
    {
      name: 'cinema-auth',
      partialize: (s) => ({ accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export const syncTokensToStorage = () => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  else localStorage.removeItem(ACCESS_KEY);
};
