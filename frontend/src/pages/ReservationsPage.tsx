/**
 * 예매 내역 — cinema theme
 * 인증은 ProtectedRoute에서 보장됨
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { NoirButton } from '@/components/common/NoirButton';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import { slideUp, staggerContainer } from '@/lib/animations';
import type { ReservationDetailResponse } from '@/types/reservation.types';

export function ReservationsPage() {
  const { showError } = useToast();

  const { data: list, isLoading: loading, error } = useQuery<ReservationDetailResponse[]>({
    queryKey: ['my-reservations'],
    queryFn: async () => {
      const res = await reservationsApi.getMyReservations();
      return res.data ?? [];
    },
  });

  useEffect(() => {
    if (error) showError(getErrorMessage(error));
  }, [error, showError]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center py-12">
        <LoadingSpinner size="lg" message="예매 내역을 불러오는 중..." />
      </div>
    );
  }

  const items = list ?? [];

  return (
    <div className="py-6">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">예매 내역</h1>
      {items.length === 0 ? (
        <GlassCard padding={false}>
          <EmptyState
            title="예매 내역이 없습니다"
            message="영화 목록에서 상영을 선택해 예매해 보세요."
            icon={<span>🎬</span>}
            action={<NoirButton to="/movies">영화 목록</NoirButton>}
          />
        </GlassCard>
      ) : (
        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {items.map((r) => (
            <motion.li key={r.reservationId} variants={slideUp}>
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
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
