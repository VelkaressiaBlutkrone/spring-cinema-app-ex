/**
 * 현재 사용자가 관리자(ADMIN)인지 여부
 * JWT payload의 role claim으로 판단.
 */
import { useAuthStore } from '@/stores/authStore';
import { isAdminFromToken } from '@/utils/jwt';

export function useIsAdmin(): boolean {
  const accessToken = useAuthStore((s) => s.accessToken);
  return isAdminFromToken(accessToken);
}
