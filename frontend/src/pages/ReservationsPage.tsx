/**
 * 예매 내역 페이지 (본인 예매 목록)
 * GET /api/reservations
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { ReservationDetailResponse } from '@/types/reservation.types';

export function ReservationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ReservationDetailResponse[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/reservations' } });
      return;
    }
    let cancelled = false;
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await reservationsApi.getMyReservations();
        if (!cancelled && res.data) setList(res.data);
      } catch (e) {
        if (!cancelled) showError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchList();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, navigate, showError]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center py-12">
        <LoadingSpinner size="lg" message="예매 내역을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">예매 내역</h1>
      {list.length === 0 ? (
        <EmptyState
          title="예매 내역이 없습니다"
          message="영화 목록에서 상영을 선택해 예매해 보세요."
          action={
            <Link
              to="/movies"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              영화 목록
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {list.map((r) => (
            <li
              key={r.reservationId}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{r.movieTitle}</p>
                  <p className="text-sm text-gray-600">
                    {r.screenName} · {formatDate(r.startTime, 'YYYY-MM-DD HH:mm')}
                  </p>
                  <p className="mt-1 text-sm font-mono text-indigo-600">{r.reservationNo}</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {r.totalSeats}석 · {formatPrice(r.totalAmount)}
                  </p>
                </div>
                <Link
                  to={`/reservations/${r.reservationId}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  상세
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
