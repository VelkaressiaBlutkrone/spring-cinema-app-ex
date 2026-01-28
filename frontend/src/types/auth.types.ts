/**
 * 인증 관련 타입
 * 백엔드 TokenResponse, MemberRequest와 맞춤
 */

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface SignUpRequest {
  loginId: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
