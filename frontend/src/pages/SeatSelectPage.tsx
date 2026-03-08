/**
 * 좌석 선택 페이지: 좌석 맵, HOLD/해제, HOLD 타이머, 실시간 갱신(SSE), 결제하기 연결
 * 경로: /book/:screeningId (영화 목록 모달에서 "예매하기"로 진입, state에 screening 전달 권장)
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSeatHoldLogic } from '@/hooks/useSeatHoldLogic';
import { SeatMap, HoldTimer } from '@/components/booking';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
import { formatDate } from '@/utils/dateUtils';
import { slideUp } from '@/lib/animations';
import type { Screening } from '@/types/movie.types';
import { SCREENING_STATUS_LABEL } from '@/types/movie.types';

export function SeatSelectPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const id = screeningId ? Number(screeningId) : null;
  const [screening, setScreening] = useState<Screening | null>(null);

  const {
    seats, loading, holdLoading, heldSeats,
    myHoldSeatIds, minHoldExpireAt,
    handleSeatClick, handleReleaseFromCart, handleTimerExpire,
  } = useSeatHoldLogic(id);

  useEffect(() => {
    const state = location.state as { screening?: Screening } | undefined;
    if (state?.screening) setScreening(state.screening);
  }, [location.state]);

  if (id == null) {
    return (
      <div className="py-8 text-center text-cinema-muted">
        상영 정보가 없습니다.{' '}
        <Link to="/movies" className="text-cinema-neon-blue hover:underline">
          영화 목록
        </Link>
        에서 예매할 상영을 선택해 주세요.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center py-12">
        <LoadingSpinner size="lg" message="좌석 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-widest text-cinema-text">
            {screening
              ? [
                  screening.theaterName,
                  screening.screenName,
                  SCREENING_STATUS_LABEL[screening.status] ?? screening.status,
                ]
                  .filter(Boolean)
                  .join(' - ') || `${screening.movieTitle} - ${screening.screenName}`
              : `상영 #${id} 좌석 선택`}
          </h1>
          {screening && (
            <p className="mt-1 text-cinema-muted">
              {formatDate(screening.startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
              {formatDate(screening.endTime, 'HH:mm')}
            </p>
          )}
        </div>
        <HoldTimer holdExpireAt={minHoldExpireAt} onExpire={handleTimerExpire} />
      </div>

      <div className="mb-6">
        <SeatMap
          seats={seats}
          myHoldSeatIds={myHoldSeatIds}
          onSeatClick={handleSeatClick}
          disabled={holdLoading}
        />
      </div>

      <AnimatePresence>
      {heldSeats.length > 0 && (
        <motion.div initial="hidden" animate="visible" exit="hidden" variants={slideUp}>
        <GlassCard>
          <h2 className="mb-2 font-medium text-cinema-text">선택한 좌석 ({heldSeats.length}석)</h2>
          <ul className="mb-4 flex flex-wrap gap-2">
            {heldSeats.map((h) => (
              <li
                key={h.seat.seatId}
                className="flex items-center gap-2 rounded-lg border border-cinema-neon-blue/40 bg-cinema-neon-blue/10 px-3 py-1.5 text-sm text-cinema-neon-blue"
              >
                <span>
                  {h.seat.rowLabel}-{h.seat.seatNo}
                </span>
                <button
                  type="button"
                  onClick={() => handleReleaseFromCart(h)}
                  disabled={holdLoading}
                  className="rounded bg-cinema-surface/80 px-2 py-0.5 text-xs text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text disabled:opacity-50"
                >
                  취소
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <NeonButton
              to={`/payment/${id}`}
              state={{
                screening,
                heldSeats: heldSeats.map((h) => ({
                  seatId: h.seat.seatId,
                  holdToken: h.holdToken,
                  rowLabel: h.seat.rowLabel,
                  seatNo: h.seat.seatNo,
                })),
              }}
            >
              결제하기
            </NeonButton>
            <NeonButton
              type="button"
              variant="ghost"
              onClick={() => {
                const go = globalThis.confirm('장바구니로 이동하시겠습니까?');
                if (go) navigate('/mypage', { state: { tab: 'holds' } });
              }}
            >
              장바구니 등록
            </NeonButton>
            <NeonButton to="/movies">
              영화 목록으로 돌아가기
            </NeonButton>
          </div>
        </GlassCard>
        </motion.div>
      )}
      </AnimatePresence>

      {heldSeats.length === 0 && (
        <div className="mt-4">
          <NeonButton to="/movies">
            영화 목록으로 돌아가기
          </NeonButton>
        </div>
      )}
    </div>
  );
}
