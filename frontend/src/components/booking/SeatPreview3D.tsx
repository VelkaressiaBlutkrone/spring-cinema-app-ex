/**
 * 2.5D 극장 시트 프리뷰 — CSS perspective 기반
 * Noir Luxe theme — 선택한 좌석에서의 스크린 시야각을 시각화
 */
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SeatStatusItem } from '@/types/seat.types';

interface SeatPreview3DProps {
  readonly seats: SeatStatusItem[];
  readonly myHoldSeatIds: Set<number>;
  readonly visible: boolean;
}

/** 좌석 위치 → 시야각 계산 (row 0=앞, col 0=왼쪽) */
function computeViewAngle(
  rowIndex: number,
  colIndex: number,
  totalRows: number,
  totalCols: number
) {
  // rotateX: 앞줄 = 큰 각도(아래에서 올려다봄), 뒷줄 = 작은 각도
  const rowRatio = totalRows > 1 ? rowIndex / (totalRows - 1) : 0.5;
  const rotateX = 35 - rowRatio * 30; // 35° → 5°

  // rotateY: 왼쪽 = 양수(오른쪽으로 돌림), 오른쪽 = 음수
  const colRatio = totalCols > 1 ? colIndex / (totalCols - 1) : 0.5;
  const rotateY = (colRatio - 0.5) * -20; // -10° → +10°

  // translateZ: 앞줄 가까이, 뒷줄 멀리
  const translateZ = -80 + rowRatio * 60; // -80 → -20

  return { rotateX, rotateY, translateZ };
}

export function SeatPreview3D({ seats, myHoldSeatIds, visible }: SeatPreview3DProps) {
  const { rows, selectedSeat, viewAngle } = useMemo(() => {
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

    const totalRows = rows.length;
    const totalCols = Math.max(1, ...rows.map(([, arr]) => arr.length));

    // 내가 hold한 좌석 중 첫 번째를 기준으로 시야각 계산
    let selectedSeat: { rowIndex: number; colIndex: number; label: string } | null = null;
    for (let ri = 0; ri < rows.length; ri++) {
      const [, rowSeats] = rows[ri];
      for (let ci = 0; ci < rowSeats.length; ci++) {
        if (myHoldSeatIds.has(rowSeats[ci].seatId)) {
          selectedSeat = {
            rowIndex: ri,
            colIndex: ci,
            label: `${rowSeats[ci].rowLabel}-${rowSeats[ci].seatNo}`,
          };
          break;
        }
      }
      if (selectedSeat) break;
    }

    const viewAngle = selectedSeat
      ? computeViewAngle(selectedSeat.rowIndex, selectedSeat.colIndex, totalRows, totalCols)
      : { rotateX: 15, rotateY: 0, translateZ: -40 };

    return { rows, selectedSeat, viewAngle, totalRows, totalCols };
  }, [seats, myHoldSeatIds]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, rotateX: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-[500px] rounded-sm border border-noir-border bg-noir-surface p-6"
          style={{ perspective: '800px' }}
        >
          {selectedSeat && (
            <p className="mb-3 text-center text-sm text-amber">
              {selectedSeat.label} 좌석에서 바라본 시야
            </p>
          )}

          <motion.div
            className="mx-auto"
            animate={{
              rotateX: viewAngle.rotateX,
              rotateY: viewAngle.rotateY,
              translateZ: viewAngle.translateZ,
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 스크린 — amber glow */}
            <div
              className="mx-auto mb-4 h-6 w-[80%] rounded-sm"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(232,168,73,0.6), rgba(232,168,73,0.2))',
                boxShadow: '0 0 24px rgba(232,168,73,0.3)',
              }}
            />

            {/* 좌석 그리드 */}
            <div className="flex flex-col items-center gap-1">
              {rows.map(([rowLabel, rowSeats], ri) => (
                <div key={rowLabel} className="flex items-center gap-0.5">
                  <span className="w-5 text-right text-[10px] text-noir-text-muted">
                    {rowLabel}
                  </span>
                  {rowSeats.map((seat, ci) => {
                    const isMyHold = myHoldSeatIds.has(seat.seatId);
                    const isSelected =
                      selectedSeat?.rowIndex === ri && selectedSeat?.colIndex === ci;
                    return (
                      <div
                        key={seat.seatId}
                        className={`h-3 w-3 rounded-[2px] transition-all duration-300 ${
                          isSelected
                            ? 'scale-150 bg-amber shadow-[0_0_8px_rgba(232,168,73,0.8)]'
                            : isMyHold
                              ? 'bg-noir-info/70'
                              : seat.status === 'AVAILABLE'
                                ? 'bg-noir-success/40'
                                : seat.status === 'RESERVED'
                                  ? 'bg-noir-danger/40'
                                  : 'bg-noir-blocked/30'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>

          {!selectedSeat && (
            <p className="mt-4 text-center text-xs text-noir-text-muted">
              좌석을 선택하면 해당 위치에서의 시야를 확인할 수 있습니다.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
