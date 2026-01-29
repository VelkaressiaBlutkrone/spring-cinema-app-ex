/**
 * 좌석 선택 페이지: 좌석 맵, HOLD/해제, HOLD 타이머, 실시간 갱신(SSE), 결제하기 연결
 * 경로: /book/:screeningId (영화 목록 모달에서 "예매하기"로 진입, state에 screening 전달 권장)
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { seatsApi } from '@/api/seats';
import { useSeatEvents } from '@/hooks/useSeatEvents';
import { SeatMap, HoldTimer } from '@/components/booking';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import type { SeatStatusItem } from '@/types/seat.types';
import type { Screening } from '@/types/movie.types';
import { SCREENING_STATUS_LABEL } from '@/types/movie.types';

interface HeldSeat {
  seat: SeatStatusItem;
  holdToken: string;
  holdExpireAt: string;
  ttlSeconds: number;
}

export function SeatSelectPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const id = screeningId ? Number(screeningId) : null;
  const [screening, setScreening] = useState<Screening | null>(null);
  const [seats, setSeats] = useState<SeatStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdLoading, setHoldLoading] = useState(false);
  const [heldSeats, setHeldSeats] = useState<HeldSeat[]>([]);

  // 서버 기준 가장 이른 만료 시각 (HOLD 타이머용)
  const minHoldExpireAt = heldSeats.length > 0
    ? heldSeats.reduce((earliest, h) =>
        (new Date(h.holdExpireAt).getTime() < new Date(earliest.holdExpireAt).getTime() ? h : earliest)
      ).holdExpireAt
    : undefined;

  const myHoldSeatIds = new Set(heldSeats.map((h) => h.seat.seatId));

  const loadSeats = useCallback(async () => {
    if (id == null) return;
    try {
      const res = await seatsApi.getSeatLayout(id);
      if (res.data?.seats) setSeats(res.data.seats);
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    if (id == null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadSeats();
  }, [id, loadSeats]);

  // SSE: 변경된 seatId 목록 수신 시 해당 좌석만 재조회하여 반영 (Optimistic 보조)
  useSeatEvents(id, (seatIds) => {
    if (seatIds.length === 0) return;
    loadSeats();
  });

  useEffect(() => {
    const state = location.state as { screening?: Screening } | undefined;
    if (state?.screening) setScreening(state.screening);
  }, [location.state]);

  const handleSeatClick = async (seat: SeatStatusItem) => {
    if (id == null || holdLoading) return;
    if (!isAuthenticated) {
      showError('로그인 후 좌석을 선택할 수 있습니다.');
      navigate('/login', { state: { from: `/book/${id}` } });
      return;
    }

    if (seat.status === 'AVAILABLE') {
      setHoldLoading(true);
      try {
        const res = await seatsApi.holdSeat(id, seat.seatId);
        const data = res.data;
        if (data) {
          setHeldSeats((prev) => [
            ...prev,
            {
              seat: { ...seat, status: 'HOLD' as const, holdExpireAt: data.holdExpireAt },
              holdToken: data.holdToken,
              holdExpireAt: data.holdExpireAt,
              ttlSeconds: data.ttlSeconds,
            },
          ]);
          setSeats((prev) =>
            prev.map((s) =>
              s.seatId === seat.seatId
                ? { ...s, status: 'HOLD' as const, holdExpireAt: data.holdExpireAt }
                : s
            )
          );
          showSuccess('좌석이 선택되었습니다.');
        }
      } catch (e) {
        showError(getErrorMessage(e));
      } finally {
        setHoldLoading(false);
      }
      return;
    }

    if (seat.status === 'HOLD' && myHoldSeatIds.has(seat.seatId)) {
      const held = heldSeats.find((h) => h.seat.seatId === seat.seatId);
      if (!held) return;
      setHoldLoading(true);
      try {
        await seatsApi.releaseHold({
          screeningId: id,
          seatId: seat.seatId,
          holdToken: held.holdToken,
        });
        setHeldSeats((prev) => prev.filter((h) => h.seat.seatId !== seat.seatId));
        setSeats((prev) =>
          prev.map((s) =>
            s.seatId === seat.seatId ? { ...s, status: 'AVAILABLE' as const, holdExpireAt: undefined } : s
          )
        );
        showSuccess('선택이 해제되었습니다.');
      } catch (e) {
        showError(getErrorMessage(e));
      } finally {
        setHoldLoading(false);
      }
    }
  };

  const handleTimerExpire = () => {
    loadSeats();
    setHeldSeats([]);
  };

  if (id == null) {
    return (
      <div className="py-8 text-center text-cinema-muted">
        상영 정보가 없습니다.{' '}
        <Link to="/movies" className="text-cinema-neon-blue hover:underline">영화 목록</Link>에서 예매할 상영을 선택해 주세요.
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
          <h1
            className="font-display text-2xl tracking-widest text-cinema-text"
          >
            {screening
              ? ([screening.theaterName, screening.screenName, SCREENING_STATUS_LABEL[screening.status] ?? screening.status]
                  .filter(Boolean)
                  .join(' - ') || `${screening.movieTitle} - ${screening.screenName}`)
              : `상영 #${id} 좌석 선택`}
          </h1>
          {screening && (
            <p className="mt-1 text-cinema-muted">
              {formatDate(screening.startTime, 'YYYY-MM-DD HH:mm')} ~ {formatDate(screening.endTime, 'HH:mm')}
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

      {heldSeats.length > 0 && (
        <GlassCard>
          <h2 className="mb-2 font-medium text-cinema-text">선택한 좌석 ({heldSeats.length}석)</h2>
          <ul className="mb-4 flex flex-wrap gap-2">
            {heldSeats.map((h) => (
              <li
                key={h.seat.seatId}
                className="rounded-lg border border-cinema-neon-blue/40 bg-cinema-neon-blue/10 px-3 py-1 text-sm text-cinema-neon-blue"
              >
                {h.seat.rowLabel}-{h.seat.seatNo}
              </li>
            ))}
          </ul>
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
        </GlassCard>
      )}

      <p className="mt-4 text-sm text-cinema-muted">
        <Link to="/movies" className="text-cinema-neon-blue hover:underline">영화 목록</Link>으로 돌아가기
      </p>
    </div>
  );
}
