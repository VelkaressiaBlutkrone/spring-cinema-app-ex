/**
 * 메인(홈) 페이지 (Step 10 개선)
 * - 현재 사용자 예매 목록(로그인 시)
 * - 3일 이내 상영 예정 영화 목록
 * - 영화관/상영관 현재 상태 요약
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeApi, type HomeStatsResponse, type UpcomingMovieItem } from '@/api/home';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { ReservationDetailResponse } from '@/types/reservation.types';

const RECENT_RESERVATIONS = 5;

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
      <section className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">영화관 예매 시스템</h1>
        <p className="text-gray-600">
          상영 중인 영화를 확인하고 편리하게 예매하세요.
        </p>
      </section>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner size="lg" message="메인 화면을 불러오는 중..." />
        </div>
      ) : (
        <div className="space-y-10">
          {/* 영화관/상영관 현재 상태 */}
          {stats && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">영화관 현황</h2>
              <div className="flex flex-wrap gap-6 text-gray-600">
                <span>영화관 <strong className="text-gray-900">{stats.theaterCount}</strong>개</span>
                <span>상영관 <strong className="text-gray-900">{stats.screenCount}</strong>개</span>
                <span>오늘 상영 <strong className="text-gray-900">{stats.todayScreeningCount}</strong>편</span>
              </div>
            </section>
          )}

          {/* 3일 이내 상영 예정 영화 */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              3일 이내 상영 예정 영화
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-gray-500">상영 예정 영화가 없습니다.</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {upcoming.map((m) => (
                  <li key={m.id}>
                    <Link
                      to="/movies"
                      className="text-indigo-600 hover:underline"
                    >
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/movies"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              영화 목록에서 상영 시간표 보기 →
            </Link>
          </section>

          {/* 현재 사용자 예매 목록 (로그인 시) */}
          {isAuthenticated && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">나의 최근 예매</h2>
              {reservations.length === 0 ? (
                <p className="mb-4 text-gray-500">예매 내역이 없습니다.</p>
              ) : (
                <ul className="mb-4 space-y-3">
                  {reservations.map((r) => (
                    <li
                      key={r.reservationId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <span className="font-medium text-gray-800">{r.movieTitle}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(r.startTime, 'YYYY-MM-DD HH:mm')} · {r.screenName}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatPrice(r.totalAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/reservations"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                예매 내역 전체 보기 →
              </Link>
            </section>
          )}

          {/* 빠른 이동: 영화 목록 */}
          <section className="flex flex-wrap justify-center gap-6">
            <Link
              to="/movies"
              className="flex w-64 flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <span className="text-2xl">🎬</span>
              <span className="mt-2 font-semibold text-gray-800">영화 목록</span>
              <span className="mt-1 text-sm text-gray-500">
                상영 중인 영화와 상영 시간표 확인
              </span>
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
