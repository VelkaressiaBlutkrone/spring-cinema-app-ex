/**
 * 상단 네비게이션 바 (Cinematic)
 * Glassmorphic, neon accent, active underline
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';

const navLinks = [
  { to: '/', label: '홈' },
  { to: '/movies', label: '영화 찾기' },
  { to: '/reservations', label: '예매 내역' },
];

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-cinema-glass-border bg-cinema-surface/80 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(18, 18, 18, 0.85)' }}
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
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-cinema-neon-blue sm:left-4 sm:right-4"
                    style={{ boxShadow: '0 0 8px var(--color-cinema-neon-blue)' }}
                  />
                )}
              </Link>
            );
          })}
          <Link
            to="/admin"
            className="rounded-lg px-3 py-2 text-sm text-cinema-muted transition hover:bg-cinema-glass hover:text-cinema-text sm:px-4"
          >
            관리자
          </Link>
          <span className="mx-1 h-4 w-px bg-cinema-glass-border" />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-cinema-glass px-3 py-2 text-sm font-medium text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-cinema-neon-blue px-3 py-2 text-sm font-medium text-cinema-bg transition hover:opacity-90"
              style={{ boxShadow: '0 0 16px rgba(0, 212, 255, 0.4)' }}
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
