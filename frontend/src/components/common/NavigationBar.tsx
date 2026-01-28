/**
 * 상단 네비게이션 바: 로고, 메뉴, 로그인/로그아웃
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export function NavigationBar() {
  const navigate = useNavigate();
  const { isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
          영화관 예매
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900"
          >
            홈
          </Link>
          <Link
            to="/movies"
            className="text-gray-600 hover:text-gray-900"
          >
            영화 목록
          </Link>
          {isAuthenticated && (
            <Link
              to="/reservations"
              className="text-gray-600 hover:text-gray-900"
            >
              예매 내역
            </Link>
          )}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
