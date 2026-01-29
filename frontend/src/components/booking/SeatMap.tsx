/**
 * 좌석 맵 컴포넌트 (SVG)
 * 좌석 상태별 시각적 구분, 클릭 시 HOLD/해제
 */
import { useMemo } from 'react';
import type { SeatStatusItem } from '@/types/seat.types';

const CELL_W = 56;
const CELL_H = 48;
const GAP = 6;

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: '#22c55e',
  HOLD: '#3b82f6',
  PAYMENT_PENDING: '#eab308',
  RESERVED: '#ef4444',
  CANCELLED: '#9ca3af',
  BLOCKED: '#4b5563',
  DISABLED: '#d1d5db',
};

const OTHER_HOLD_COLOR = '#f59e0b'; // 다른 사용자 HOLD

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

export function SeatMap({
  seats,
  myHoldSeatIds,
  onSeatClick,
  disabled = false,
}: Readonly<SeatMapProps>) {
  const { rows, width, height } = useMemo(() => {
    const rows = groupSeatsByRow(seats);
    const cols = Math.max(1, ...rows.map(([, arr]) => arr.length));
    const w = cols * (CELL_W + GAP) - GAP + 80;
    const h = rows.length * (CELL_H + GAP) - GAP + 48;
    return { rows, width: w, height: h };
  }, [seats]);

  const getFill = (seat: SeatStatusItem) => {
    if (seat.status === 'HOLD' && !myHoldSeatIds.has(seat.seatId)) {
      return OTHER_HOLD_COLOR;
    }
    return STATUS_COLOR[seat.status] ?? '#9ca3af';
  };

  const isClickable = (seat: SeatStatusItem) => {
    if (disabled) return false;
    if (seat.status === 'AVAILABLE') return true;
    if (seat.status === 'HOLD' && myHoldSeatIds.has(seat.seatId)) return true;
    return false;
  };

  if (seats.length === 0) {
    return (
      <div className="rounded-xl border border-cinema-glass-border bg-cinema-surface p-8 text-center text-cinema-muted">
        좌석 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cinema-glass-border bg-cinema-surface p-4 text-cinema-muted">
      <svg width={width} height={height} className="min-w-0">
        {rows.map(([rowLabel, rowSeats], ri) =>
          rowSeats.map((seat, ci) => {
            const x = 40 + ci * (CELL_W + GAP);
            const y = 24 + ri * (CELL_H + GAP);
            const fill = getFill(seat);
            const clickable = isClickable(seat);
            return (
              <g key={seat.seatId}>
                <rect
                  x={x}
                  y={y}
                  width={CELL_W}
                  height={CELL_H}
                  rx={4}
                  fill={fill}
                  stroke={clickable ? '#1e40af' : '#e5e7eb'}
                  strokeWidth={clickable ? 2 : 1}
                  className={clickable ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}
                  onClick={() => clickable && onSeatClick(seat)}
                  aria-label={`${rowLabel}-${seat.seatNo} ${seat.status}`}
                />
                <text
                  x={x + CELL_W / 2}
                  y={y + CELL_H / 2 + 4}
                  textAnchor="middle"
                  className="fill-white text-sm font-medium"
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
            className="text-sm text-cinema-muted fill-current"
          >
            {rowLabel}
          </text>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-cinema-muted">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ background: STATUS_COLOR.AVAILABLE }}
          />{' '}
          예매 가능
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: '#3b82f6' }} /> 내
          선택
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
