/**
 * 좌석 HOLD/해제 로직 커스텀 훅
 * SeatSelectPage에서 추출 — 좌석 로딩, HOLD, 해제, SSE, 타이머 만료 처리
 *
 * RULE 6.2: SSE 이벤트 시 변경된 좌석만 부분 업데이트 (전체 좌석 재전송 금지)
 * RULE 12.1: Optimistic UI 사용 시 실패 시 롤백 로직 필수
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { seatsApi } from '@/api/seats';
import { useSeatEvents } from '@/hooks/useSeatEvents';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/errorHandler';
import { logSeatHold, logSeatRelease } from '@/utils/logger';
import type { SeatStatusItem } from '@/types/seat.types';

export interface HeldSeat {
  seat: SeatStatusItem;
  holdToken: string;
  holdExpireAt: string;
  ttlSeconds: number;
}

export function useSeatHoldLogic(screeningId: number | null) {
  const { showSuccess, showError } = useToast();
  const [seats, setSeats] = useState<SeatStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdLoading, setHoldLoading] = useState(false);
  const [heldSeats, setHeldSeats] = useState<HeldSeat[]>([]);

  const minHoldExpireAt = useMemo(
    () =>
      heldSeats.length > 0
        ? heldSeats.reduce<HeldSeat>(
            (earliest, h) =>
              new Date(h.holdExpireAt).getTime() < new Date(earliest.holdExpireAt).getTime()
                ? h
                : earliest,
            heldSeats[0]
          ).holdExpireAt
        : undefined,
    [heldSeats]
  );

  const myHoldSeatIds = useMemo(
    () => new Set(heldSeats.map((h) => h.seat.seatId)),
    [heldSeats]
  );

  const heldSeatsFromApi = useCallback((seatsList: SeatStatusItem[]): HeldSeat[] => {
    return seatsList
      .filter((s) => s.status === 'HOLD' && s.isHeldByCurrentUser && s.holdToken)
      .map((s) => ({
        seat: s,
        holdToken: s.holdToken!,
        holdExpireAt: s.holdExpireAt ?? '',
        ttlSeconds: 0,
      }));
  }, []);

  const loadSeats = useCallback(async () => {
    if (screeningId == null) return;
    try {
      const res = await seatsApi.getSeatLayout(screeningId);
      if (res.data?.seats) {
        setSeats(res.data.seats);
        setHeldSeats(heldSeatsFromApi(res.data.seats));
      }
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [screeningId, showError, heldSeatsFromApi]);

  /**
   * RULE 6.2: 변경된 좌석만 부분 업데이트
   * SSE에서 변경 seatId 목록을 수신하면, 서버에서 전체 레이아웃을 가져오되
   * 상태 변경은 해당 seatId에 해당하는 좌석만 갱신하여 불필요한 리렌더 방지
   */
  const updateChangedSeats = useCallback(async (changedSeatIds: number[]) => {
    if (screeningId == null) return;
    try {
      const res = await seatsApi.getSeatLayout(screeningId);
      if (res.data?.seats) {
        const changedSet = new Set(changedSeatIds);
        const updatedMap = new Map(
          res.data.seats
            .filter((s) => changedSet.has(s.seatId))
            .map((s) => [s.seatId, s])
        );
        setSeats((prev) =>
          prev.map((s) => updatedMap.get(s.seatId) ?? s)
        );
        // 내 HOLD 목록도 변경된 좌석 기준으로 갱신
        setHeldSeats((prev) => {
          const stillHeld = prev.filter((h) => {
            const updated = updatedMap.get(h.seat.seatId);
            // 변경된 좌석 중 더 이상 내 HOLD가 아닌 것은 제거
            if (updated) {
              return updated.status === 'HOLD' && updated.isHeldByCurrentUser;
            }
            return true; // 변경 대상이 아니면 유지
          });
          // 새로 내 HOLD가 된 좌석 추가 (다른 탭에서 HOLD한 경우 등)
          const existingIds = new Set(stillHeld.map((h) => h.seat.seatId));
          const newHolds = heldSeatsFromApi(
            res.data!.seats.filter((s) => changedSet.has(s.seatId) && !existingIds.has(s.seatId))
          );
          return [...stillHeld, ...newHolds];
        });
      }
    } catch {
      // SSE 부분 업데이트 실패 시 전체 갱신 fallback
      loadSeats();
    }
  }, [screeningId, heldSeatsFromApi, loadSeats]);

  useEffect(() => {
    if (screeningId == null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadSeats();
  }, [screeningId, loadSeats]);

  // SSE: 변경된 seatId 목록 수신 시 해당 좌석만 부분 업데이트
  useSeatEvents(screeningId, (seatIds) => {
    if (seatIds.length === 0) return;
    updateChangedSeats(seatIds);
  });

  const handleSeatClick = async (seat: SeatStatusItem) => {
    if (screeningId == null || holdLoading) return;

    if (seat.status === 'AVAILABLE') {
      setHoldLoading(true);
      try {
        const res = await seatsApi.holdSeat(screeningId, seat.seatId);
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
          logSeatHold(screeningId, [seat.seatId], 1);
        }
      } catch (e) {
        showError(getErrorMessage(e));
      } finally {
        setHoldLoading(false);
      }
      return;
    }

    if (seat.status === 'HOLD' && myHoldSeatIds.has(seat.seatId)) {
      const token = seat.holdToken ?? heldSeats.find((h) => h.seat.seatId === seat.seatId)?.holdToken;
      if (!token) return;

      // RULE 12.1: Optimistic UI — 즉시 해제 표시 후 실패 시 롤백
      const prevSeats = seats;
      const prevHeldSeats = heldSeats;

      setHeldSeats((prev) => prev.filter((h) => h.seat.seatId !== seat.seatId));
      setSeats((prev) =>
        prev.map((s) =>
          s.seatId === seat.seatId
            ? { ...s, status: 'AVAILABLE' as const, holdExpireAt: undefined, holdToken: undefined, isHeldByCurrentUser: false }
            : s
        )
      );

      setHoldLoading(true);
      try {
        await seatsApi.releaseHold({
          screeningId,
          seatId: seat.seatId,
          holdToken: token,
        });
        showSuccess('선택이 해제되었습니다.');
        logSeatRelease(screeningId, [seat.seatId]);
      } catch (e) {
        // 롤백: 서버 실패 시 이전 상태 복원
        setSeats(prevSeats);
        setHeldSeats(prevHeldSeats);
        showError(getErrorMessage(e));
      } finally {
        setHoldLoading(false);
      }
    }
  };

  const handleReleaseFromCart = async (held: HeldSeat) => {
    if (screeningId == null || holdLoading) return;

    // RULE 12.1: Optimistic UI — 즉시 해제 표시 후 실패 시 롤백
    const prevSeats = seats;
    const prevHeldSeats = heldSeats;

    setHeldSeats((prev) => prev.filter((h) => h.seat.seatId !== held.seat.seatId));
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId === held.seat.seatId
          ? { ...s, status: 'AVAILABLE' as const, holdExpireAt: undefined, holdToken: undefined, isHeldByCurrentUser: false }
          : s
      )
    );

    setHoldLoading(true);
    try {
      await seatsApi.releaseHold({
        screeningId,
        seatId: held.seat.seatId,
        holdToken: held.holdToken,
      });
      showSuccess('선택이 해제되었습니다.');
      logSeatRelease(screeningId, [held.seat.seatId]);
    } catch (e) {
      // 롤백: 서버 실패 시 이전 상태 복원
      setSeats(prevSeats);
      setHeldSeats(prevHeldSeats);
      showError(getErrorMessage(e));
    } finally {
      setHoldLoading(false);
    }
  };

  const handleTimerExpire = () => {
    loadSeats();
    setHeldSeats([]);
  };

  return {
    seats,
    loading,
    holdLoading,
    heldSeats,
    myHoldSeatIds,
    minHoldExpireAt,
    handleSeatClick,
    handleReleaseFromCart,
    handleTimerExpire,
  };
}
