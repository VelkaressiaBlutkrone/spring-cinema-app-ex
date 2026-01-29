/**
 * 회원/인증 API (Hybrid Encryption + HttpOnly Cookie)
 * - 로그인/회원가입: EncryptedPayload (RSA + AES-GCM)
 * - Refresh Token: HttpOnly Cookie (withCredentials)
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody } from '@/types/api.types';
import type { LoginRequest, SignUpRequest } from '@/types/auth.types';
import { encryptPayload, type EncryptedPayload } from '@/utils/hybridEncryption';

const BASE = '/members';
const PUBLIC_KEY_URL = '/public-key';

/** AccessTokenResponse (Refresh는 쿠키) */
export interface AccessTokenResponse {
  accessToken: string;
}

/** PublicKey 응답 */
interface PublicKeyResponse {
  publicKeyPem: string;
}

async function getPublicKeyPem(): Promise<string> {
  const { data } = await axiosInstance.get<ApiResponseBody<PublicKeyResponse>>(PUBLIC_KEY_URL);
  if (!data?.success || !data?.data?.publicKeyPem) {
    throw new Error('공개키를 가져올 수 없습니다.');
  }
  return data.data.publicKeyPem;
}

export const authApi = {
  /** 로그인 (EncryptedPayload) → AccessToken, Refresh는 Set-Cookie */
  login: async (body: LoginRequest): Promise<AccessTokenResponse> => {
    const pem = await getPublicKeyPem();
    const payload: EncryptedPayload = await encryptPayload(pem, {
      loginId: body.loginId,
      password: body.password,
    });
    const { data } = await axiosInstance.post<AccessTokenResponse>(`${BASE}/login`, payload, {
      withCredentials: true,
    });
    return data;
  },

  /** 회원 가입 (EncryptedPayload) */
  signup: async (body: SignUpRequest): Promise<number> => {
    const pem = await getPublicKeyPem();
    const payload: EncryptedPayload = await encryptPayload(pem, {
      loginId: body.loginId,
      password: body.password,
      name: body.name,
      email: body.email,
      ...(body.phone != null && body.phone !== '' ? { phone: body.phone } : {}),
    });
    const { data } = await axiosInstance.post<number>(`${BASE}/signup`, payload);
    return data;
  },

  /** 토큰 갱신 (Cookie: refreshToken) → AccessToken */
  refresh: async (): Promise<AccessTokenResponse> => {
    const { data } = await axiosInstance.post<AccessTokenResponse>(
      `${BASE}/refresh`,
      {},
      {
        withCredentials: true,
      }
    );
    return data;
  },

  /** 로그아웃 (쿠키 삭제) */
  logout: async (): Promise<void> => {
    await axiosInstance.post(`${BASE}/logout`, undefined, { withCredentials: true });
  },
};
