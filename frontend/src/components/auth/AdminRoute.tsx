/**
 * 관리자 전용 라우트 가드
 * 미인증 시 /admin/login, 인증되었으나 비관리자 시 /로 리디렉트
 */
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useIsAdmin } from '@/hooks';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const isAdmin = useIsAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
