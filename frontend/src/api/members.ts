/**
 * 회원 프로필 / 마이페이지 API
 * GET/PATCH /api/members/me, GET /api/members/me/holds
 */
import { axiosInstance } from '@/api/axiosInstance';
import type { ApiResponseBody } from '@/types/api.types';
import type {
  MemberProfileResponse,
  MemberUpdateRequest,
  MemberHoldSummaryResponse,
} from '@/types/member.types';

const BASE = '/members';

export const membersApi = {
  /** 본인 프로필 조회 */
  getProfile: async (): Promise<MemberProfileResponse> => {
    const { data } = await axiosInstance.get<ApiResponseBody<MemberProfileResponse> | MemberProfileResponse>(
      `${BASE}/me`
    );
    const wrapped = data as ApiResponseBody<MemberProfileResponse>;
    return wrapped.data != null ? wrapped.data : (data as MemberProfileResponse);
  },

  /** 본인 정보 수정 (password, name, email, phone — 선택) */
  updateProfile: async (body: MemberUpdateRequest): Promise<void> => {
    await axiosInstance.patch(`${BASE}/me`, body);
  },

  /** 본인 HOLD(장바구니) 목록 */
  getMyHolds: async (): Promise<MemberHoldSummaryResponse[]> => {
    const { data } = await axiosInstance.get<
      ApiResponseBody<MemberHoldSummaryResponse[]> | MemberHoldSummaryResponse[]
    >(`${BASE}/me/holds`);
    const wrapped = data as ApiResponseBody<MemberHoldSummaryResponse[]>;
    return wrapped.data != null ? wrapped.data : (data as MemberHoldSummaryResponse[]);
  },
};
