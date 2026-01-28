/**
 * 예매 상세 페이지
 * GET /api/reservations/{reservationId}
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { ReservationDetailResponse } from '@/types/reservation.types';

export function ReservationDetailPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { showError } = useToast();
  const id = reservationId ? Number(reservationId) : null;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ReservationDetailResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/reservations/${id}` } });
      return;
    }
    if (id == null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchDetail = async () => {
      try {
        const res = await reservationsApi.getReservationDetail(id);
        if (!cancelled && res.data) setDetail(res.data);
      } catch (e) {
        if (!cancelled) showError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, navigate, showError]);

  if (!isAuthenticated) return null;
  if (id == null) {
    return (
      <div className="py-12 text-center text-gray-600">
        <p>예매 정보가 없습니다.</p>
        <Link to="/reservations" className="mt-4 inline-block text-indigo-600 hover:underline">
          예매 내역
        </Link>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center py-12">
        <LoadingSpinner size="lg" message="예매 상세를 불러오는 중..." />
      </div>
    );
  }
  if (!detail) {
    return (
      <div className="py-12 text-center text-gray-600">
        <p>예매 정보를 찾을 수 없습니다.</p>
        <Link to="/reservations" className="mt-4 inline-block text-indigo-600 hover:underline">
          예매 내역
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">예매 상세</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-600">예매 번호</dt>
            <dd className="mt-1 font-mono font-semibold text-gray-900">{detail.reservationNo}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">영화</dt>
            <dd className="mt-1 text-gray-900">{detail.movieTitle}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">상영관 / 상영 시간</dt>
            <dd className="mt-1 text-gray-900">
              {detail.screenName} · {formatDate(detail.startTime, 'YYYY-MM-DD HH:mm')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">좌석</dt>
            <dd className="mt-1 text-gray-900">
              {detail.seats?.map((s) => s.displayName ?? `${s.rowLabel}-${s.seatNo}`).join(', ') ?? '-'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">좌석별 금액 (서버 계산값)</dt>
            <dd className="mt-1">
              <ul className="space-y-1 text-gray-800">
                {detail.seats?.map((s) => (
                  <li key={s.seatId}>
                    {s.displayName ?? `${s.rowLabel}-${s.seatNo}`}: {formatPrice(s.price)}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">총 결제 금액</dt>
            <dd className="mt-1 font-semibold text-gray-900">{formatPrice(detail.totalAmount)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">예매 상태</dt>
            <dd className="mt-1 text-gray-900">{detail.status}</dd>
          </div>
        </dl>
        <div className="mt-6 flex gap-3">
          <Link
            to="/reservations"
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            예매 내역
          </Link>
          <Link
            to="/movies"
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            영화 목록
          </Link>
        </div>
      </div>
    </div>
  );
}
