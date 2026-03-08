/**
 * 메인(홈) 페이지 — 2026 Cinematic theme
 * Hero, 영화관 현황, 3일 이내 상영 예정, 나의 최근 예매, 지금 바로 예매하기 CTA
 */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
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
import { fadeIn, slideUp, slideInLeft, staggerContainer } from '@/lib/animations';
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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<HomeStatsResponse | null>({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const res = await homeApi.getStats();
      return res.data ?? null;
    },
  });

  const {
    data: upcoming = [],
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useQuery<UpcomingMovieItem[]>({
    queryKey: ['upcoming-movies', 3],
    queryFn: async () => {
      const res = await homeApi.getUpcomingMovies(3);
      return res.data ?? [];
    },
  });

  const {
    data: reservations = [],
    error: reservationsError,
  } = useQuery<ReservationDetailResponse[]>({
    queryKey: ['my-reservations-recent'],
    queryFn: async () => {
      const res = await reservationsApi.getMyReservations();
      return (res.data ?? []).slice(0, RECENT_RESERVATIONS);
    },
    enabled: isAuthenticated,
  });

  const error = statsError ?? upcomingError ?? reservationsError;
  useEffect(() => {
    if (error) showError(getErrorMessage(error));
  }, [error, showError]);

  const loading = statsLoading || upcomingLoading;

  return (
    <div className="py-8">
      {/* Hero — parallax */}
      <motion.section
        ref={heroRef}
        className="relative mb-10 overflow-hidden rounded-2xl"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* 배경 영상 (없으면 그라데이션 fallback) — parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-[130%] w-full object-cover opacity-40"
            aria-hidden
            poster=""
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cinema-neon-red/20 via-cinema-neon-blue/10 to-cinema-surface"
          aria-hidden
          style={{ y: heroY }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-cinema-bg/90 to-transparent"
          aria-hidden
        />
        <motion.div
          className="relative flex min-h-[200px] flex-col justify-end px-6 py-8 sm:min-h-[240px] sm:px-10"
          variants={slideUp}
          style={{ opacity: heroOpacity }}
        >
          <h1 className="hero-title mb-2 font-display text-4xl tracking-[0.2em] text-cinema-text sm:text-5xl">
            {'영화관 예매'.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </h1>
          <p className="text-cinema-muted">상영 중인 영화를 확인하고 편리하게 예매하세요.</p>
        </motion.div>
      </motion.section>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner size="lg" message="메인 화면을 불러오는 중..." />
        </div>
      ) : (
        <motion.div
          className="space-y-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* 영화관 현황 */}
          {stats && (
            <motion.section variants={slideUp}>
              <SectionTitle>영화관 현황</SectionTitle>
              <GlassCard>
                <div className="flex flex-wrap gap-6 text-cinema-muted">
                  <span>
                    영화관 <strong className="stat-glow text-cinema-text">{stats.theaterCount}</strong>개
                  </span>
                  <span>
                    상영관 <strong className="stat-glow text-cinema-text">{stats.screenCount}</strong>개
                  </span>
                  <span>
                    오늘 상영{' '}
                    <strong className="stat-glow text-cinema-text">{stats.todayScreeningCount}</strong>편
                  </span>
                </div>
              </GlassCard>
            </motion.section>
          )}

          {/* 3일 이내 상영 예정 — 수평 스크롤 (앨범 넘기기) */}
          <motion.section variants={slideInLeft}>
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
                      <div className="relative aspect-[2/3] overflow-hidden bg-cinema-surface-elevated">
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
                        <div className="poster-overlay" aria-hidden />
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
          </motion.section>

          {/* 빠른 예매 / 나의 최근 예매 통합 */}
          <motion.section variants={slideUp}>
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
          </motion.section>
        </motion.div>
      )}
    </div>
  );
}
