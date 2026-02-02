/**
 * 회원/마이페이지 도메인 타입
 * 백엔드 MemberProfileResponse, MemberRequest.UpdateProfile, MemberHoldSummaryResponse 등과 맞춤
 */

export interface MemberProfileResponse {
  loginId: string;
  name: string;
  email: string | null;
  phone: string | null;
}

/** PATCH /api/members/me — 전달된 필드만 수정 */
export interface MemberUpdateRequest {
  password?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface MemberHoldSeatItem {
  seatId: number;
  rowLabel: string;
  seatNo: number;
  displayName: string;
  holdToken: string;
  holdExpireAt: string; // ISO
}

export interface MemberHoldSummaryResponse {
  screeningId: number;
  movieTitle: string;
  screenName: string;
  startTime: string; // ISO
  seats: MemberHoldSeatItem[];
}
