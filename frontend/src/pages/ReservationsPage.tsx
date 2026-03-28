/**
 * 예매 내역 — Noir Luxe theme
 * 인증은 ProtectedRoute에서 보장됨
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { NoirCard } from '@/components/common/NoirCard';
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
      <h1 className="mb-6 font-display text-2xl tracking-widest text-noir-text">예매 내역</h1>
      {items.length === 0 ? (
        <NoirCard padding={false}>
          <EmptyState
            title="예매 내역이 없습니다"
            message="영화 목록에서 상영을 선택해 예매해 보세요."
            icon={<span>🎬</span>}
            action={<NoirButton to="/movies">영화 목록</NoirButton>}
          />
        </NoirCard>
      ) : (
        <motion.ul
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ listStyle: 'none' }}
        >
          {items.map((r) => (
            <motion.li key={r.reservationId} variants={slideUp}>
              <Link
                to={`/reservations/${r.reservationId}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-sm border border-noir-border bg-noir-surface px-4 py-3.5 transition-all duration-300 hover:translate-x-1 hover:border-noir-border-hover hover:bg-noir-elevated"
              >
                <span className="flex h-12 w-9 items-center justify-center rounded-sm border border-noir-border bg-noir-elevated text-lg text-noir-text-muted">
                  🎬
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-noir-text transition group-hover:text-amber">
                    {r.movieTitle}
                  </p>
                  <p className="flex flex-wrap items-center gap-1 text-[11px] text-noir-text-muted">
                    <span>{formatDate(r.startTime, 'YYYY-MM-DD HH:mm')}</span>
                    <span className="inline-block h-[3px] w-[3px] rounded-full bg-noir-text-muted" />
                    <span>{r.screenName}</span>
                    <span className="inline-block h-[3px] w-[3px] rounded-full bg-noir-text-muted" />
                    <span>{r.totalSeats}석</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-noir-text-muted">
                    {r.reservationNo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber">
                    {formatPrice(r.totalAmount)}
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[2px] text-noir-success">
                    확정됨
                  </p>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
