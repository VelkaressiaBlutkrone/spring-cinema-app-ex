/**
 * Footer — Noir Luxe design system
 * 브랜딩, 바로가기, 고객 지원, 운영 시간
 */
import { Link } from 'react-router-dom';

const quickLinks = [
  { to: '/movies', label: '영화 목록' },
  { to: '/reservations', label: '예매 내역' },
  { to: '/mypage', label: '마이페이지' },
];

const supportLinks = [
  { to: '#', label: '자주 묻는 질문' },
  { to: '#', label: '이용약관' },
  { to: '#', label: '개인정보처리방침' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-noir-border bg-noir-surface">
      {/* Top amber line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(232,168,73,0.3), transparent)',
        }}
        aria-hidden
      />

      <div className="container mx-auto px-4 pb-8 pt-12">
        {/* Grid */}
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="mb-3 font-display text-xl tracking-[0.15em] text-noir-text">
              영화관 예매
            </p>
            <p className="max-w-[260px] text-xs leading-relaxed text-noir-text-muted">
              특별한 영화 경험을 위한 프리미엄 예매 시스템. 최적의 좌석에서
              최고의 영화를 만나보세요.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-[9px] uppercase tracking-[3px] text-amber/70">
              바로가기
            </h3>
            {quickLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block py-1 text-xs text-noir-text-muted transition hover:text-amber"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-[9px] uppercase tracking-[3px] text-amber/70">
              고객 지원
            </h3>
            {supportLinks.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="block py-1 text-xs text-noir-text-muted transition hover:text-amber"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-[9px] uppercase tracking-[3px] text-amber/70">
              운영 시간
            </h3>
            <p className="py-1 text-xs text-noir-text-muted">
              평일 09:00 — 22:00
            </p>
            <p className="py-1 text-xs text-noir-text-muted">
              주말 10:00 — 23:00
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-noir-border pt-6 text-[11px] text-noir-text-muted">
          <span>&copy; {new Date().getFullYear()} 영화관 예매. All rights reserved.</span>
          <div className="flex gap-3">
            {(['IG', 'X', 'YT'] as const).map((label) => (
              <span
                key={label}
                className="flex h-8 w-8 items-center justify-center border border-noir-border text-[11px] text-noir-text-muted transition hover:border-amber/50 hover:text-amber"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
