/**
 * 상단 네비게이션 바 — Noir Luxe design system
 * Sticky, amber accent, serif logo, uppercase nav links
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
          ? 'border-noir-border bg-noir-bg/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'border-noir-border bg-noir-bg/85 backdrop-blur-xl'
      }`}
    >
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          to="/"
          className="font-display text-xl tracking-widest text-noir-text transition hover:text-amber"
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
                className={`relative px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[2px] transition sm:px-4 ${
                  active ? 'text-amber' : 'text-noir-text-muted hover:text-noir-text'
                }`}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber shadow-[0_1px_0_0_#e8a849,0_0_8px_rgba(232,168,73,0.4)] sm:left-4 sm:right-4"
                  />
                )}
              </Link>
            );
          })}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-2 font-sans text-[10px] uppercase tracking-[2px] text-noir-text-muted transition hover:bg-noir-hover hover:text-noir-text sm:px-4"
            >
              관리자
            </Link>
          )}
          {isAuthenticated && (
            <>
              <span className="mx-1 h-4 w-px bg-noir-border" />
              <Link
                to="/mypage"
                className="max-w-[120px] truncate px-2 text-[10px] font-sans uppercase tracking-[2px] text-noir-text-muted transition hover:text-amber sm:max-w-[160px]"
              >
                {loginId ?? '회원'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-noir-surface px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[2px] text-noir-text-muted transition hover:bg-noir-hover hover:text-noir-text"
              >
                로그아웃
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-amber px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-[2px] text-noir-bg shadow-[0_0_16px_rgba(232,168,73,0.3)] transition hover:bg-amber-hover"
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
