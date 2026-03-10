/**
 * 마이페이지 - 결제/예매 내역 탭
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { ReservationDetailResponse } from '@/types/reservation.types';

export function ReservationsTab() {
  const { showError } = useToast();
  const [reservations, setReservations] = useState<ReservationDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    reservationsApi
      .getMyReservations()
      .then((res) => (res.data ? setReservations(res.data) : setReservations([])))
      .catch((e) => showError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [showError]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner size="lg" message="예매 내역을 불러오는 중..." />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <NoirCard padding={false}>
        <EmptyState
          title="예매 내역이 없습니다"
          message="영화 목록에서 상영을 선택해 예매해 보세요."
          icon={<span>🎬</span>}
          action={<NoirButton to="/movies">영화 목록</NoirButton>}
        />
      </NoirCard>
    );
  }

  return (
    <ul className="space-y-4">
      {reservations.map((r) => (
        <li key={r.reservationId}>
          <NoirCard>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-noir-text">{r.movieTitle}</p>
                <p className="text-sm text-noir-text-muted">
                  {r.screenName} · {formatDate(r.startTime, 'YYYY-MM-DD HH:mm')}
                </p>
                <p className="mt-1 font-mono text-sm text-amber">{r.reservationNo}</p>
                <p className="mt-1 text-sm text-amber">
                  {r.totalSeats}석 · {formatPrice(r.totalAmount)}
                </p>
                {r.payment && (
                  <p className="mt-1 text-xs text-noir-text-muted">
                    결제 {r.payment.payStatus} · {formatPrice(r.payment.payAmount)}
                    {r.payment.paidAt && ` · ${formatDate(r.payment.paidAt, 'YYYY-MM-DD HH:mm')}`}
                  </p>
                )}
              </div>
              <Link
                to={`/reservations/${r.reservationId}`}
                className="rounded-sm border border-noir-border bg-amber-subtle px-3 py-1.5 text-sm font-medium text-noir-text-muted transition hover:bg-noir-border hover:text-noir-text"
              >
                상세
              </Link>
            </div>
          </NoirCard>
        </li>
      ))}
    </ul>
  );
}
