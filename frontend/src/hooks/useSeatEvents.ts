/**
 * SSE 실시간 좌석 상태 구독 훅
 * GET /api/screenings/{screeningId}/seat-events
 * 이벤트: seat-status-changed, payload: { eventId, screeningId, seatIds }
 * 연결 끊김 시 지수 백오프로 자동 재연결
 */
import { useEffect, useRef, useCallback } from 'react';
import type { SeatStatusChangedEvent } from '@/types/seat.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

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

    let cancelled = false;
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout>;
    let es: EventSource;

    function connect() {
      if (cancelled) return;

      const url = `${API_BASE.replace(/\/$/, '')}/screenings/${screeningId}/seat-events`;
      es = new EventSource(url);

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

      es.onopen = () => {
        retryCount = 0;
      };

      es.onerror = () => {
        es.close();
        if (cancelled) return;
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** retryCount, RECONNECT_MAX_MS);
        retryCount++;
        retryTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      es?.close();
    };
  }, [screeningId, stableOnChange]);
}
