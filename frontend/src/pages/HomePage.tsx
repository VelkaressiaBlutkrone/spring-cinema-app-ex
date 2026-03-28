/**
 * 메인(홈) 페이지 — Noir Luxe theme
 * Hero(파티클+듀얼CTA), 영화관 현황(개별카드), 3일 이내 상영(카드 리디자인), 나의 최근 예매(카드형)
 */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { homeApi, type HomeStatsResponse, type UpcomingMovieItem } from '@/api/home';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';
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
  return (
    <div className="mb-4">
      <span className="text-[10px] uppercase tracking-[3px] text-amber/50">collection</span>
      <h2 className="font-display text-lg tracking-widest text-noir-text">{children}</h2>
    </div>
  );
}

/** 히어로 파티클 하나 */
function HeroParticle({ left, delay }: { left: string; delay: number }) {
  return (
    <motion.div
      className="absolute h-[2px] w-[2px] rounded-full bg-amber"
      style={{ left }}
      initial={{ opacity: 0, y: '100%', scale: 0 }}
      animate={{ opacity: [0, 0.6, 0.3, 0], y: '-100vh', scale: 1.5 }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    />
  );
}

const PARTICLES = [
  { left: '10%', delay: 0 },
  { left: '25%', delay: 1.2 },
  { left: '45%', delay: 2.4 },
  { left: '65%', delay: 0.8 },
  { left: '80%', delay: 3.2 },
  { left: '90%', delay: 1.8 },
];

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
      {/* ── Hero — parallax + particles + dual CTA ── */}
      <motion.section
        ref={heroRef}
        className="relative mb-10 overflow-hidden rounded-sm"
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
          className="absolute inset-0 bg-gradient-to-br from-amber/20 via-noir-surface/10 to-noir-surface"
          aria-hidden
          style={{ y: heroY }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-noir-bg/95 via-noir-bg/30 to-transparent"
          aria-hidden
        />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {PARTICLES.map((p, i) => (
            <HeroParticle key={i} left={p.left} delay={p.delay} />
          ))}
        </div>

        <motion.div
          className="relative flex min-h-[300px] flex-col justify-end px-6 py-10 sm:min-h-[340px] sm:px-10"
          variants={slideUp}
          style={{ opacity: heroOpacity }}
        >
          <motion.span
            className="mb-3 text-[9px] uppercase tracking-[5px] text-amber/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Premium Cinema Experience
          </motion.span>
          <h1 className="hero-title mb-2 font-display text-4xl tracking-[0.2em] text-noir-text sm:text-5xl">
            {'영화관 예매'.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.3 + i * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </h1>
          <motion.div
            className="my-4 h-px w-12 bg-gradient-to-r from-amber to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            aria-hidden
          />
          <p className="max-w-md text-[13px] leading-relaxed text-noir-text-muted">
            상영 중인 영화를 확인하고, 최적의 좌석을 선택하여 특별한 영화 경험을 시작하세요.
          </p>
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <NoirButton to="/movies">지금 바로 예매하기</NoirButton>
            <NoirButton to="/movies" variant="ghost">
              상영 일정 보기
            </NoirButton>
          </motion.div>
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
          {/* ── 영화관 현황 — 개별 카드 그리드 ── */}
          {stats && (
            <motion.section variants={slideUp}>
              <SectionTitle>영화관 현황</SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: '영화관', value: stats.theaterCount, unit: '개소 운영 중' },
                  { label: '상영관', value: stats.screenCount, unit: '스크린 보유' },
                  { label: '오늘 상영', value: stats.todayScreeningCount, unit: '편 예정' },
                ].map((item) => (
                  <NoirCard key={item.label} className="group relative overflow-hidden">
                    <p className="mb-1 text-[9px] uppercase tracking-[3px] text-noir-text-muted">
                      {item.label}
                    </p>
                    <p className="stat-glow font-display text-3xl text-noir-text">
                      {item.value}
                    </p>
                    <p className="text-[11px] text-noir-text-muted">{item.unit}</p>
                    {/* bottom accent on hover */}
                    <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-amber to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                  </NoirCard>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── 3일 이내 상영 예정 — 카드 리디자인 ── */}
          <motion.section variants={slideInLeft}>
            <SectionTitle>3일 이내 상영 예정 영화</SectionTitle>
            <NoirCard padding={false} className="overflow-hidden">
              {upcoming.length === 0 ? (
                <p className="p-6 text-noir-text-muted">상영 예정 영화가 없습니다.</p>
              ) : (
                <ul
                  className="flex gap-4 overflow-x-auto scroll-snap-x px-4 pb-4 pt-2 md:px-6"
                  style={{ listStyle: 'none' }}
                  aria-label="상영 예정 영화 목록"
                >
                  {upcoming.map((m) => (
                    <li key={m.id} className="scroll-snap-item shrink-0">
                      <Link
                        to="/movies"
                        className="group relative flex w-[min(180px,36vw)] flex-col overflow-hidden rounded-sm border border-noir-border bg-noir-surface transition-all duration-400 hover:-translate-y-1 hover:border-amber/40 hover:shadow-[0_8px_40px_rgba(232,168,73,0.12)] focus:outline-none focus:ring-2 focus:ring-amber/50"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden bg-noir-elevated">
                          {m.posterUrl ? (
                            <img
                              src={m.posterUrl}
                              alt={m.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl text-noir-text-muted/40">
                              🎬
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-noir-bg/95 to-transparent" />
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-2 text-xs font-medium text-noir-text transition group-hover:text-amber">
                            {m.title}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </NoirCard>
          </motion.section>

          {/* ── 나의 최근 예매 — 카드형 레이아웃 ── */}
          <motion.section variants={slideUp}>
            <SectionTitle>
              {isAuthenticated && reservations.length > 0 ? '나의 최근 예매' : '빠른 예매'}
            </SectionTitle>
            {isAuthenticated && reservations.length > 0 ? (
              <div>
                <ul className="mb-4 space-y-2" style={{ listStyle: 'none' }}>
                  {reservations.map((r) => (
                    <li key={r.reservationId}>
                      <Link
                        to={`/reservations/${r.reservationId}`}
                        className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-sm border border-noir-border bg-noir-surface px-4 py-3 transition-all duration-300 hover:translate-x-1 hover:border-noir-border-hover hover:bg-noir-elevated"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-noir-border bg-noir-elevated text-lg text-noir-text-muted">
                          🎬
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-noir-text transition group-hover:text-amber">
                            {r.movieTitle}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-noir-text-muted">
                            <span>{formatDate(r.startTime, 'YYYY-MM-DD HH:mm')}</span>
                            <span className="inline-block h-[3px] w-[3px] rounded-full bg-noir-text-muted" />
                            <span>{r.screenName}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber">
                            {formatPrice(r.totalAmount)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/reservations"
                  className="text-sm font-medium text-amber transition hover:underline"
                >
                  예매 내역 전체 보기 →
                </Link>
              </div>
            ) : (
              <NoirCard>
                <div className="relative flex flex-col items-center gap-4 overflow-hidden py-10 text-center">
                  <span
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(232,168,73,0.03),transparent_60%)]"
                    aria-hidden
                  />
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-noir-border bg-amber-subtle text-2xl text-amber/50">
                    ▶
                  </span>
                  <p className="font-display text-lg tracking-widest text-noir-text">
                    {isAuthenticated ? '첫 예매를 시작해보세요' : '지금 바로 예매를 시작해보세요'}
                  </p>
                  <p className="max-w-xs text-sm leading-relaxed text-noir-text-muted">
                    영화 목록에서 원하는 상영을 선택하고, 최적의 좌석을 골라 특별한 경험을 시작하세요.
                  </p>
                  <NoirButton to="/movies" variant="ghost">
                    영화 둘러보기 →
                  </NoirButton>
                </div>
              </NoirCard>
            )}
          </motion.section>
        </motion.div>
      )}
    </div>
  );
}
