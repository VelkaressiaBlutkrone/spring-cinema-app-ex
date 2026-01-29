/**
 * 관리자 레이아웃: 사이드바 + 헤더 + 컨텐츠
 * /admin/login 은 비인증 허용, 그 외 /admin/* 는 ADMIN Role 필요
 */
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const SIDEBAR_LINKS = [
  { to: '/admin', label: '대시보드' },
  { to: '/admin/movies', label: '영화 관리' },
  { to: '/admin/theaters', label: '영화관 관리' },
  { to: '/admin/screens', label: '상영관 관리' },
  { to: '/admin/screenings', label: '상영 스케줄' },
  { to: '/admin/seats', label: '좌석 관리' },
  { to: '/admin/reservations', label: '예매 내역' },
  { to: '/admin/payments', label: '결제 내역' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAdmin = useIsAdmin();
  const isLoginPage = location.pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Outlet />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link to="/admin" className="font-semibold text-gray-800">
            관리자
          </Link>
        </div>
        <nav className="p-2">
          {SIDEBAR_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to))
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <span className="text-sm text-gray-600">영화관 예매 관리자</span>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              사용자 사이트
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              로그아웃
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
