/**
 * 상단 네비게이션 바 (Cinematic)
 * Glassmorphic, neon accent, active underline
 */
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { getSubFromToken } from '@/utils/jwt';

const navLinks = [
  { to: '/', label: '홈' },
  { to: '/movies', label: '영화 찾기' },
  { to: '/reservations', label: '예매 내역' },
];

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getAccessToken, clearAuth } = useAuthStore();
  const isAdmin = useIsAdmin();
  const loginId = useMemo(
    () => (isAuthenticated ? getSubFromToken(getAccessToken()) : null),
    [isAuthenticated, getAccessToken]
  );

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-cinema-glass-border bg-[rgba(10,10,10,0.95)] backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'border-transparent bg-[rgba(18,18,18,0.6)] backdrop-blur-xl'
      }`}
    >
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          to="/"
          className="font-display text-xl tracking-widest text-cinema-text transition hover:text-cinema-neon-blue"
        >
          영화관 예매
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map(({ to, label }) => {
            const active =
              location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3 py-2 text-sm font-medium transition sm:px-4 ${
                  active ? 'text-cinema-neon-blue' : 'text-cinema-muted hover:text-cinema-text'
                }`}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-cinema-neon-blue shadow-[0_0_8px_var(--color-cinema-neon-blue)] sm:left-4 sm:right-4"
                  />
                )}
              </Link>
            );
          })}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="rounded-lg px-3 py-2 text-sm text-cinema-muted transition hover:bg-cinema-glass hover:text-cinema-text sm:px-4"
            >
              관리자
            </Link>
          )}
          {isAuthenticated && (
            <>
              <span className="mx-1 h-4 w-px bg-cinema-glass-border" />
              <Link
                to="/mypage"
                className="max-w-[120px] truncate px-2 text-sm text-cinema-muted transition hover:text-cinema-neon-blue sm:max-w-[160px]"
              >
                {loginId ?? '회원'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-cinema-glass px-3 py-2 text-sm font-medium text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text"
              >
                로그아웃
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="rounded-lg bg-cinema-neon-blue px-3 py-2 text-sm font-medium text-cinema-bg shadow-[0_0_16px_rgba(0,212,255,0.4)] transition hover:opacity-90"
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
