/**
 * 메인(홈) 페이지 — 2026 Cinematic theme
 * Hero, 영화관 현황, 3일 이내 상영 예정, 나의 최근 예매, 지금 바로 예매하기 CTA
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeApi, type HomeStatsResponse, type UpcomingMovieItem } from '@/api/home';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { ReservationDetailResponse } from '@/types/reservation.types';

const RECENT_RESERVATIONS = 5;

interface SectionTitleProps {
  readonly children: React.ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return <h2 className="mb-4 font-display text-lg tracking-widest text-cinema-text">{children}</h2>;
}

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HomeStatsResponse | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingMovieItem[]>([]);
  const [reservations, setReservations] = useState<ReservationDetailResponse[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, upcomingRes] = await Promise.all([
          homeApi.getStats(),
          homeApi.getUpcomingMovies(3),
        ]);
        if (cancelled) return;
        if (statsRes.data) setStats(statsRes.data);
        if (upcomingRes.data) setUpcoming(upcomingRes.data);

        if (isAuthenticated) {
          const resRes = await reservationsApi.getMyReservations();
          if (!cancelled && resRes.data) {
            setReservations(resRes.data.slice(0, RECENT_RESERVATIONS));
          }
        }
      } catch (e) {
        if (!cancelled) showError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, showError]);

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 bg-gradient-to-br from-cinema-neon-red/20 via-cinema-neon-blue/10 to-cinema-surface"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-cinema-bg/80 to-transparent"
          aria-hidden
        />
        <div className="relative flex min-h-[200px] flex-col justify-end px-6 py-8 sm:min-h-[240px] sm:px-10">
          <h1 className="mb-2 font-display text-4xl tracking-[0.2em] text-cinema-text drop-shadow-[0_0_20px_rgba(0,212,255,0.3)] sm:text-5xl">
            영화관 예매
          </h1>
          <p className="text-cinema-muted">상영 중인 영화를 확인하고 편리하게 예매하세요.</p>
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner size="lg" message="메인 화면을 불러오는 중..." />
        </div>
      ) : (
        <div className="space-y-10">
          {/* 영화관 현황 */}
          {stats && (
            <section>
              <SectionTitle>영화관 현황</SectionTitle>
              <GlassCard>
                <div className="flex flex-wrap gap-6 text-cinema-muted">
                  <span>
                    영화관 <strong className="text-cinema-text">{stats.theaterCount}</strong>개
                  </span>
                  <span>
                    상영관 <strong className="text-cinema-text">{stats.screenCount}</strong>개
                  </span>
                  <span>
                    오늘 상영{' '}
                    <strong className="text-cinema-text">{stats.todayScreeningCount}</strong>편
                  </span>
                </div>
              </GlassCard>
            </section>
          )}

          {/* 3일 이내 상영 예정 — 수평 스크롤 (앨범 넘기기) */}
          <section>
            <SectionTitle>3일 이내 상영 예정 영화</SectionTitle>
            <GlassCard padding={false} className="overflow-hidden">
              {upcoming.length === 0 ? (
                <p className="p-6 text-cinema-muted">상영 예정 영화가 없습니다.</p>
              ) : (
                <ul
                  className="flex gap-4 overflow-x-auto pb-4 pt-2 scroll-snap-x px-4 md:px-6 list-none"
                  aria-label="상영 예정 영화 목록"
                >
                  {upcoming.map((m) => (
                    <li key={m.id} className="scroll-snap-item shrink-0">
                      <Link
                      to="/movies"
                      className="group flex flex-col overflow-hidden rounded-xl border border-cinema-glass-border bg-cinema-surface transition-all duration-300 hover:scale-[1.03] hover:border-cinema-neon-blue/50 hover:shadow-[0_0_32px_rgba(0,212,255,0.2)] focus:outline-none focus:ring-2 focus:ring-cinema-neon-blue/50 block w-[min(160px,28vw)]"
                    >
                      <div className="aspect-[2/3] overflow-hidden bg-cinema-surface-elevated">
                        {m.posterUrl ? (
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl text-cinema-muted-dark">
                            🎬
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="line-clamp-2 text-xs font-medium text-cinema-text transition group-hover:text-cinema-neon-blue">
                          {m.title}
                        </p>
                      </div>
                    </Link>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </section>

          {/* 빠른 예매 / 나의 최근 예매 통합 */}
          <section>
            <SectionTitle>
              {isAuthenticated && reservations.length > 0 ? '나의 최근 예매' : '빠른 예매'}
            </SectionTitle>
            <GlassCard>
              {isAuthenticated && reservations.length > 0 ? (
                <>
                  <ul className="mb-4 space-y-3">
                    {reservations.map((r) => (
                      <li
                        key={r.reservationId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-3"
                      >
                        <span className="font-medium text-cinema-text">{r.movieTitle}</span>
                        <span className="text-sm text-cinema-muted">
                          {formatDate(r.startTime, 'YYYY-MM-DD HH:mm')} · {r.screenName}
                        </span>
                        <span className="text-sm font-medium text-cinema-neon-amber">
                          {formatPrice(r.totalAmount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/reservations"
                    className="text-sm font-medium text-cinema-neon-blue transition hover:underline"
                  >
                    예매 내역 전체 보기 →
                  </Link>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <span className="text-5xl text-cinema-muted-dark/60" aria-hidden>
                    🎬
                  </span>
                  <p className="text-cinema-muted">
                    {isAuthenticated ? '첫 예매를 시작해보세요' : '지금 바로 예매를 시작해보세요'}
                  </p>
                  <p className="text-sm text-cinema-muted-dark">
                    영화 목록에서 상영을 선택해 예매해 보세요.
                  </p>
                  <NeonButton to="/movies">지금 바로 예매하기</NeonButton>
                </div>
              )}
            </GlassCard>
          </section>
        </div>
      )}
    </div>
  );
}
