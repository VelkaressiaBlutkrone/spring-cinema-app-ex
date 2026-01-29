/**
 * 관리자 대시보드 — 통계(KPI·차트) + 바로가기
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
} from 'recharts';
import {
  adminStatsApi,
  type StatsKpiResponse,
  type StatsDailyItem,
  type StatsTopMovieItem,
} from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice, formatNumber } from '@/utils/formatters';

const DAILY_DAYS = 30;
const TOP_MOVIES_LIMIT = 5;

export function AdminDashboardPage() {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<StatsKpiResponse | null>(null);
  const [daily, setDaily] = useState<StatsDailyItem[]>([]);
  const [topMovies, setTopMovies] = useState<StatsTopMovieItem[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, dailyRes, topRes] = await Promise.all([
        adminStatsApi.getKpi(),
        adminStatsApi.getDailyTrend(DAILY_DAYS),
        adminStatsApi.getTopMoviesByBookings(TOP_MOVIES_LIMIT),
      ]);
      if (kpiRes.data) setKpi(kpiRes.data);
      if (dailyRes.data) setDaily(dailyRes.data);
      if (topRes.data) setTopMovies(topRes.data);
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" message="대시보드를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <button
          type="button"
          onClick={fetchAll}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          새로고침
        </button>
      </div>

      {/* 통계: KPI 카드 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">오늘 KPI</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="오늘 매출"
            value={formatPrice(kpi?.todaySales ?? 0)}
            variant="primary"
          />
          <KpiCard
            label="오늘 예매 건수"
            value={formatNumber(kpi?.todayBookings ?? 0)}
            variant="default"
          />
          <KpiCard
            label="오늘 좌석 점유율"
            value={`${kpi?.todayOccupancyPercent ?? 0}%`}
            variant={(kpi?.todayOccupancyPercent ?? 0) >= 50 ? 'good' : 'default'}
          />
          <KpiCard
            label="노쇼 예상금액"
            value={formatPrice(kpi?.todayNoShowAmount ?? 0)}
            variant="muted"
          />
        </div>
      </section>

      {/* 통계: 일별 매출·예매 추이 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          일별 매출 · 예매 건수 (최근 {DAILY_DAYS}일)
        </h2>
        <div className="h-80 w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
          <ResponsiveContainer width="100%" height="100%" minWidth={400}>
            <ComposedChart
              data={daily.map((d) => ({
                ...d,
                dateLabel: typeof d.date === 'string' ? d.date.slice(5).replace('-', '/') : '',
              }))}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="sales" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
              <YAxis yAxisId="bookings" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === '매출' ? [formatPrice(value), name] : [formatNumber(value), name]
                }
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Legend />
              <Bar yAxisId="sales" dataKey="sales" name="매출" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="bookings"
                type="monotone"
                dataKey="bookings"
                name="예매 건수"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 통계: 오늘 상영 영화 TOP5 예매 순위 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          오늘 상영 영화 TOP{TOP_MOVIES_LIMIT} 예매 순위
        </h2>
        {topMovies.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
            오늘 상영 예정인 영화가 없거나 예매 데이터가 없습니다.
          </div>
        ) : (
          <div className="h-80 w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
              <BarChart
                data={topMovies}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="movieTitle" width={72} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), '예매 건수']}
                  labelFormatter={(label) => `영화: ${label}`}
                />
                <Bar dataKey="bookingCount" name="예매 건수" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 바로가기 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">바로가기</h2>
        <p className="mb-4 text-gray-600">
          아래 메뉴에서 영화, 영화관, 상영관, 상영 스케줄, 좌석을 관리할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/movies"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            영화 관리
          </Link>
          <Link
            to="/admin/theaters"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            영화관 관리
          </Link>
          <Link
            to="/admin/screens"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            상영관 관리
          </Link>
          <Link
            to="/admin/screenings"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            상영 스케줄
          </Link>
          <Link
            to="/admin/seats"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            좌석 관리
          </Link>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  variant = 'default',
}: Readonly<{
  label: string;
  value: string;
  variant?: 'primary' | 'good' | 'muted' | 'default';
}>) {
  const bg = {
    primary: 'bg-indigo-50 border-indigo-200',
    good: 'bg-green-50 border-green-200',
    muted: 'bg-gray-50 border-gray-200',
    default: 'bg-white border-gray-200',
  }[variant];
  const text = {
    primary: 'text-indigo-800',
    good: 'text-green-800',
    muted: 'text-gray-600',
    default: 'text-gray-900',
  }[variant];

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`mt-2 text-xl font-bold ${text}`}>{value}</p>
    </div>
  );
}
