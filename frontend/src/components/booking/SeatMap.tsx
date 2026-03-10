/**
 * 좌석 맵 컴포넌트 (SVG)
 * Noir Luxe theme — 좌석 상태별 시각적 구분, 클릭 시 HOLD/해제, 선택 시 bouncy 애니메이션
 */
import { useCallback, useMemo, useState } from 'react';
import type { SeatStatusItem } from '@/types/seat.types';

const CELL_W = 56;
const CELL_H = 48;
const GAP = 6;

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: '#4a9e6e',
  HOLD: '#5b7db8',
  PAYMENT_PENDING: '#d49248',
  RESERVED: '#c44040',
  CANCELLED: '#6b6b6b',
  BLOCKED: '#3a3a3a',
  DISABLED: '#3a3a3a',
};

const OTHER_HOLD_COLOR = '#e8a849'; // 다른 사용자 HOLD

export interface SeatMapProps {
  seats: SeatStatusItem[];
  /** 내가 HOLD한 좌석 ID 집합 (이 좌석들은 클릭 시 해제) */
  myHoldSeatIds: Set<number>;
  onSeatClick: (seat: SeatStatusItem) => void;
  disabled?: boolean;
}

/** rowLabel 기준 그룹, 행 내 seatNo 오름차순 */
function groupSeatsByRow(seats: SeatStatusItem[]): [string, SeatStatusItem[]][] {
  const byRow = new Map<string, SeatStatusItem[]>();
  for (const s of seats) {
    const row = s.rowLabel || '?';
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row)!.push(s);
  }
  for (const arr of byRow.values()) {
    arr.sort((a, b) => a.seatNo - b.seatNo);
  }
  const rows = Array.from(byRow.entries()).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  return rows;
}

const BOUNCE_DURATION_MS = 400;

export function SeatMap({
  seats,
  myHoldSeatIds,
  onSeatClick,
  disabled = false,
}: Readonly<SeatMapProps>) {
  const [bouncingSeatId, setBouncingSeatId] = useState<number | null>(null);

  const handleSeatClick = useCallback(
    (seat: SeatStatusItem) => {
      setBouncingSeatId(seat.seatId);
      globalThis.setTimeout(() => setBouncingSeatId(null), BOUNCE_DURATION_MS);
      onSeatClick(seat);
    },
    [onSeatClick]
  );

  const { rows, width, height } = useMemo(() => {
    const rows = groupSeatsByRow(seats);
    const cols = Math.max(1, ...rows.map(([, arr]) => arr.length));
    const w = cols * (CELL_W + GAP) - GAP + 80;
    const h = rows.length * (CELL_H + GAP) - GAP + 48;
    return { rows, width: w, height: h };
  }, [seats]);

  const isMyHold = (seat: SeatStatusItem) =>
    seat.status === 'HOLD' && (seat.isHeldByCurrentUser ?? myHoldSeatIds.has(seat.seatId));

  const getFill = (seat: SeatStatusItem) => {
    if (seat.status === 'HOLD' && !isMyHold(seat)) {
      return OTHER_HOLD_COLOR;
    }
    return STATUS_COLOR[seat.status] ?? '#6b6b6b';
  };

  const getOpacity = (seat: SeatStatusItem) => {
    if (seat.status === 'DISABLED') return 0.5;
    return 1;
  };

  const isClickable = (seat: SeatStatusItem) => {
    if (disabled) return false;
    if (seat.status === 'AVAILABLE') return true;
    if (seat.status === 'HOLD' && isMyHold(seat)) return true;
    return false;
  };

  const getClickHandler = (seat: SeatStatusItem) => {
    if (!isClickable(seat)) return undefined;
    return () => handleSeatClick(seat);
  };

  if (seats.length === 0) {
    return (
      <div className="rounded-sm border border-noir-border bg-noir-surface p-8 text-center text-noir-text-muted">
        좌석 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-noir-border bg-noir-surface p-4 text-noir-text-muted">
      {/* Screen indicator — amber projector beam */}
      <div
        className="mx-auto mb-6 h-1 w-[70%] rounded-sm"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(232,168,73,0.4), rgba(232,168,73,0.6), rgba(232,168,73,0.4), transparent)',
          boxShadow: '0 0 16px rgba(232,168,73,0.2)',
        }}
      />
      <p className="mb-4 text-center font-sans text-[10px] font-medium uppercase tracking-[3px] text-noir-text-muted">
        Screen
      </p>

      <svg width={width} height={height} className="min-w-0">
        {rows.map(([rowLabel, rowSeats], ri) =>
          rowSeats.map((seat, ci) => {
            const x = 40 + ci * (CELL_W + GAP);
            const y = 24 + ri * (CELL_H + GAP);
            const fill = getFill(seat);
            const clickable = isClickable(seat);
            const isBouncing = bouncingSeatId === seat.seatId;
            const seatOpacity = getOpacity(seat);
            return (
              <g
                key={seat.seatId}
                className={isBouncing ? 'animate-seat-bounce' : undefined}
                style={{
                  ...(isBouncing
                    ? { transformOrigin: `${x + CELL_W / 2}px ${y + CELL_H / 2}px` }
                    : {}),
                  opacity: seatOpacity,
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={CELL_W}
                  height={CELL_H}
                  rx={4}
                  fill={fill}
                  stroke={clickable ? 'rgba(232,168,73,0.4)' : 'rgba(232,168,73,0.08)'}
                  strokeWidth={clickable ? 2 : 1}
                  strokeDasharray={seat.status === 'BLOCKED' ? '4 2' : undefined}
                  className={clickable ? 'cursor-pointer seat-hover' : 'cursor-not-allowed opacity-70'}
                  onClick={getClickHandler(seat)}
                  aria-label={`${rowLabel}-${seat.seatNo} ${seat.status}`}
                />
                <text
                  x={x + CELL_W / 2}
                  y={y + CELL_H / 2 + 4}
                  textAnchor="middle"
                  className="fill-noir-text text-sm font-medium"
                  style={{ pointerEvents: 'none' }}
                >
                  {seat.seatNo}
                </text>
              </g>
            );
          })
        )}
        {rows.map(([rowLabel], ri) => (
          <text
            key={rowLabel}
            x={8}
            y={24 + ri * (CELL_H + GAP) + CELL_H / 2 + 4}
            textAnchor="end"
            className="text-sm fill-noir-text-muted"
          >
            {rowLabel}
          </text>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-noir-text-muted">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ background: STATUS_COLOR.AVAILABLE }}
          />{' '}
          예매 가능
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: STATUS_COLOR.HOLD }} />{' '}
          내 선택
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: OTHER_HOLD_COLOR }} />{' '}
          다른 고객 선택
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ background: STATUS_COLOR.RESERVED }}
          />{' '}
          예매 완료
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ background: STATUS_COLOR.BLOCKED }}
          />{' '}
          운영 차단
        </span>
      </div>
    </div>
  );
}
