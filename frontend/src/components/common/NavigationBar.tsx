/**
 * 상단 네비게이션 바 — Noir Luxe design system
 * Sticky, amber accent, serif logo, uppercase nav links
 * 모바일: 풀스크린 드로어 메뉴
 */
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { getSubFromToken } from '@/utils/jwt';

const navLinks = [
  { to: '/', label: '홈', num: '01' },
  { to: '/movies', label: '영화 찾기', num: '02' },
  { to: '/reservations', label: '예매 내역', num: '03' },
  { to: '/mypage', label: '마이페이지', num: '04' },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(() => {
    clearAuth();
    setMobileOpen(false);
    navigate('/');
  }, [clearAuth, navigate]);

  // 페이지 이동 시 드로어 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // 드로어 열릴 때 body scroll 잠금
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
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

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex md:gap-2">
            {navLinks.slice(0, 3).map(({ to, label }) => {
              const active =
                location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-3 py-2 font-sans text-xs font-medium tracking-wide transition sm:px-4 ${
                    active ? 'text-amber' : 'text-noir-text-muted hover:text-noir-text'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber shadow-[0_1px_0_0_#e8a849,0_0_8px_rgba(232,168,73,0.4)] sm:left-4 sm:right-4" />
                  )}
                </Link>
              );
            })}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 font-sans text-xs tracking-wide text-noir-text-muted transition hover:bg-noir-hover hover:text-noir-text sm:px-4"
              >
                관리자
              </Link>
            )}
            {isAuthenticated && (
              <>
                <span className="mx-1 h-4 w-px bg-noir-border" />
                <Link
                  to="/mypage"
                  className="max-w-[120px] truncate px-2 font-sans text-xs tracking-wide text-noir-text-muted transition hover:text-amber sm:max-w-[160px]"
                >
                  {loginId ?? '회원'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-noir-surface px-3 py-2 font-sans text-xs font-medium tracking-wide text-noir-text-muted transition hover:bg-noir-hover hover:text-noir-text"
                >
                  로그아웃
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="bg-amber px-4 py-2 font-sans text-xs font-semibold tracking-wide text-noir-bg shadow-[0_0_16px_rgba(232,168,73,0.3)] transition hover:bg-amber-hover"
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            <span
              className={`block h-[1.5px] w-5 bg-amber transition-all duration-300 ${
                mobileOpen ? 'translate-y-[6.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[1.5px] w-5 bg-amber transition-all duration-300 ${
                mobileOpen ? 'scale-x-0 opacity-0' : ''
              }`}
            />
            <span
              className={`block h-[1.5px] w-5 bg-amber transition-all duration-300 ${
                mobileOpen ? '-translate-y-[6.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-14 z-30 bg-noir-bg/98 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex h-full flex-col px-6 py-8">
              {navLinks.map(({ to, label, num }, i) => {
                const active =
                  location.pathname === to ||
                  (to !== '/' && location.pathname.startsWith(to));
                return (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={to}
                      className={`block border-b border-noir-border py-5 transition-colors ${
                        active ? 'text-amber' : 'text-noir-text hover:text-amber'
                      }`}
                    >
                      <span className="mb-1 block font-sans text-[10px] tracking-[3px] text-amber/50">
                        {num}
                      </span>
                      <span className="font-display text-2xl tracking-[0.1em]">{label}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {isAuthenticated && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to="/admin"
                    className="block border-b border-noir-border py-5 text-noir-text transition-colors hover:text-amber"
                  >
                    <span className="mb-1 block font-sans text-[10px] tracking-[3px] text-amber/50">
                      05
                    </span>
                    <span className="font-display text-2xl tracking-[0.1em]">관리자</span>
                  </Link>
                </motion.div>
              )}

              <div className="mt-auto pt-8">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-noir-text-muted">
                      {loginId ?? '회원'}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="border border-noir-border px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[2px] text-noir-text-muted transition hover:border-amber/50 hover:text-amber"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block bg-amber py-3 text-center font-sans text-[11px] font-semibold uppercase tracking-[3px] text-noir-bg shadow-[0_0_16px_rgba(232,168,73,0.3)] transition hover:bg-amber-hover"
                  >
                    로그인
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
