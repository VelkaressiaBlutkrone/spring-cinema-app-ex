/**
 * HOLD 타이머: 서버 기준 만료 시각(holdExpireAt) 기준 남은 시간 표시
 */
import { useState, useEffect } from 'react';

export interface HoldTimerProps {
  /** 서버에서 내려준 만료 시각 ISO 문자열 */
  holdExpireAt: string | undefined;
  /** 만료 시 콜백 (선택) */
  onExpire?: () => void;
  className?: string;
}

function getRemainingSeconds(holdExpireAt: string): number {
  const end = new Date(holdExpireAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function HoldTimer({ holdExpireAt, onExpire, className = '' }: HoldTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!holdExpireAt) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const sec = getRemainingSeconds(holdExpireAt);
      setRemaining(sec);
      if (sec <= 0 && onExpire) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdExpireAt, onExpire]);

  if (!holdExpireAt || remaining <= 0) {
    return null;
  }

  const isLow = remaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 ${
        isLow ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-700'
      } ${className}`}
      role="timer"
      aria-live="polite"
    >
      <span className="font-mono text-lg font-semibold">{formatRemaining(remaining)}</span>
      <span className="text-sm">남은 시간</span>
    </div>
  );
}
