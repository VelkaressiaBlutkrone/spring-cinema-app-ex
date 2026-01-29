/**
 * 예매 내역 — cinema theme
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
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
      <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">예매 내역</h1>
      {list.length === 0 ? (
        <GlassCard padding={false}>
          <EmptyState
            title="예매 내역이 없습니다"
            message="영화 목록에서 상영을 선택해 예매해 보세요."
            icon={<span>🎬</span>}
            action={<NeonButton to="/movies">영화 목록</NeonButton>}
          />
        </GlassCard>
      ) : (
        <ul className="space-y-4">
          {list.map((r) => (
            <li key={r.reservationId}>
              <GlassCard>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-cinema-text">{r.movieTitle}</p>
                    <p className="text-sm text-cinema-muted">
                      {r.screenName} · {formatDate(r.startTime, 'YYYY-MM-DD HH:mm')}
                    </p>
                    <p className="mt-1 font-mono text-sm text-cinema-neon-blue">
                      {r.reservationNo}
                    </p>
                    <p className="mt-1 text-sm text-cinema-neon-amber">
                      {r.totalSeats}석 · {formatPrice(r.totalAmount)}
                    </p>
                  </div>
                  <Link
                    to={`/reservations/${r.reservationId}`}
                    className="rounded-lg border border-cinema-glass-border bg-cinema-glass px-3 py-1.5 text-sm font-medium text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text"
                  >
                    상세
                  </Link>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
