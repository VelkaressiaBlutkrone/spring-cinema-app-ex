/**
 * SSE 실시간 좌석 상태 구독 훅
 * GET /api/screenings/{screeningId}/seat-events
 * 이벤트: seat-status-changed, payload: { eventId, screeningId, seatIds }
 */
import { useEffect, useRef, useCallback } from 'react';
import type { SeatStatusChangedEvent } from '@/types/seat.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function useSeatEvents(
  screeningId: number | null,
  onSeatIdsChanged: (seatIds: number[]) => void
) {
  const onChangedRef = useRef(onSeatIdsChanged);
  onChangedRef.current = onSeatIdsChanged;

  const stableOnChange = useCallback((seatIds: number[]) => {
    onChangedRef.current(seatIds);
  }, []);

  useEffect(() => {
    if (screeningId == null) return;

    const url = `${API_BASE.replace(/\/$/, '')}/screenings/${screeningId}/seat-events`;
    const es = new EventSource(url);

    es.addEventListener('seat-status-changed', (e: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(e.data || '{}') as SeatStatusChangedEvent;
        if (payload.seatIds?.length) {
          stableOnChange(payload.seatIds);
        }
      } catch {
        // ignore parse error
      }
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [screeningId, stableOnChange]);
}
