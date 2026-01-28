/**
 * 회원/인증 API
 * 백엔드 MemberController: /api/members
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { LoginRequest, SignUpRequest, TokenResponse } from '@/types/auth.types';

const BASE = '/members';

export const authApi = {
  /** 로그인 (Access + Refresh Token 발급) */
  login: async (body: LoginRequest): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<TokenResponse>(`${BASE}/login`, body);
    return data;
  },

  /** 회원 가입 */
  signup: async (body: SignUpRequest): Promise<number> => {
    const { data } = await axiosInstance.post<number>(`${BASE}/signup`, body);
    return data;
  },

  /** 토큰 갱신 */
  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<TokenResponse>(`${BASE}/refresh`, {
      refreshToken,
    });
    return data;
  },

  /** 로그아웃 */
  logout: async (): Promise<void> => {
    await axiosInstance.post(`${BASE}/logout`);
  },
};
