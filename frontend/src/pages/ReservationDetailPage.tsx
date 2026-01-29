/**
 * 예매 상세 — cinema theme
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
      <div className="py-12 text-center text-cinema-muted">
        <p>예매 정보가 없습니다.</p>
        <Link to="/reservations" className="mt-4 inline-block text-cinema-neon-blue hover:underline">
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
      <div className="py-12 text-center text-cinema-muted">
        <p>예매 정보를 찾을 수 없습니다.</p>
        <Link to="/reservations" className="mt-4 inline-block text-cinema-neon-blue hover:underline">
          예매 내역
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1
        className="mb-6 font-display text-2xl tracking-widest text-cinema-text"
      >
        예매 상세
      </h1>
      <GlassCard>
        <dl className="space-y-4 text-cinema-text">
          <div>
            <dt className="text-sm font-medium text-cinema-muted">예매 번호</dt>
            <dd className="mt-1 font-mono font-semibold text-cinema-neon-blue">{detail.reservationNo}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-cinema-muted">영화</dt>
            <dd className="mt-1">{detail.movieTitle}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-cinema-muted">상영관 / 상영 시간</dt>
            <dd className="mt-1">
              {detail.screenName} · {formatDate(detail.startTime, 'YYYY-MM-DD HH:mm')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-cinema-muted">좌석</dt>
            <dd className="mt-1">
              {detail.seats?.map((s) => s.displayName ?? `${s.rowLabel}-${s.seatNo}`).join(', ') ?? '-'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-cinema-muted">좌석별 금액 (서버 계산값)</dt>
            <dd className="mt-1">
              <ul className="space-y-1 text-cinema-muted">
                {detail.seats?.map((s) => (
                  <li key={s.seatId}>
                    {s.displayName ?? `${s.rowLabel}-${s.seatNo}`}: {formatPrice(s.price)}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-cinema-muted">총 결제 금액</dt>
            <dd className="mt-1 font-semibold text-cinema-neon-amber">{formatPrice(detail.totalAmount)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-cinema-muted">예매 상태</dt>
            <dd className="mt-1">{detail.status}</dd>
          </div>
        </dl>
        <div className="mt-6 flex gap-3">
          <NeonButton to="/reservations">예매 내역</NeonButton>
          <NeonButton to="/movies" variant="ghost">영화 목록</NeonButton>
        </div>
      </GlassCard>
    </div>
  );
}
