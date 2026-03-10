/**
 * 마이페이지 - 장바구니(HOLD) 탭
 */
import { useState, useEffect } from 'react';
import { membersApi } from '@/api/members';
import { seatsApi } from '@/api/seats';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { NoirButton } from '@/components/common/NoirButton';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import type { MemberHoldSummaryResponse } from '@/types/member.types';

export function HoldsTab() {
  const { showSuccess, showError } = useToast();
  const [holds, setHolds] = useState<MemberHoldSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [releasing, setReleasing] = useState<{ key: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    membersApi
      .getMyHolds()
      .then(setHolds)
      .catch((e) => showError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [showError]);

  const handleReleaseHold = async (screeningId: number, seatId: number, holdToken: string) => {
    const key = `${screeningId}-${seatId}`;
    setReleasing({ key });
    try {
      await seatsApi.releaseHold({ screeningId, seatId, holdToken });
      showSuccess('좌석이 해제되었습니다.');
      setHolds((prev) =>
        prev
          .map((h) =>
            h.screeningId === screeningId
              ? { ...h, seats: h.seats.filter((s) => s.seatId !== seatId) }
              : h,
          )
          .filter((h) => h.seats.length > 0),
      );
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setReleasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner size="lg" message="장바구니를 불러오는 중..." />
      </div>
    );
  }

  if (holds.length === 0) {
    return (
      <GlassCard padding={false}>
        <EmptyState
          title="장바구니가 비어 있습니다"
          message="영화 목록에서 좌석을 선택하면 여기에 표시됩니다."
          icon={<span>🪑</span>}
          action={<NoirButton to="/movies">영화 목록</NoirButton>}
        />
      </GlassCard>
    );
  }

  return (
    <ul className="space-y-4">
      {holds.map((h) => (
        <li key={h.screeningId}>
          <GlassCard>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-cinema-text">{h.movieTitle}</p>
                <p className="text-sm text-cinema-muted">
                  {h.screenName} · {formatDate(h.startTime, 'YYYY-MM-DD HH:mm')}
                </p>
                <p className="mt-1 text-sm text-cinema-neon-amber">
                  {h.seats.length}석 · {h.seats.map((s) => s.displayName).join(', ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <NoirButton to={`/book/${h.screeningId}`}>결제하기</NoirButton>
              </div>
            </div>
            <ul className="mt-3 space-y-1 border-t border-cinema-glass-border pt-3">
              {h.seats.map((s) => (
                <li key={s.seatId} className="flex items-center justify-between text-sm">
                  <span className="text-cinema-muted">
                    {s.displayName} (만료: {formatDate(s.holdExpireAt, 'HH:mm')})
                  </span>
                  <button
                    type="button"
                    disabled={releasing?.key === `${h.screeningId}-${s.seatId}`}
                    onClick={() => handleReleaseHold(h.screeningId, s.seatId, s.holdToken)}
                    className="rounded-lg border border-cinema-glass-border px-2 py-1 text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text disabled:opacity-50"
                  >
                    {releasing?.key === `${h.screeningId}-${s.seatId}` ? '해제 중...' : '해제'}
                  </button>
                </li>
              ))}
            </ul>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
