/**
 * HOLD 타이머 — cinema theme
 */
import { useState, useEffect } from 'react';

export interface HoldTimerProps {
  holdExpireAt: string | undefined;
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
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${
        isLow
          ? 'border-cinema-neon-red/50 bg-cinema-neon-red/10 text-cinema-neon-red'
          : 'border-cinema-glass-border bg-cinema-glass text-cinema-muted'
      } ${className}`}
      role="timer"
      aria-live="polite"
    >
      <span className="font-mono text-lg font-semibold">{formatRemaining(remaining)}</span>
      <span className="text-sm">남은 시간</span>
    </div>
  );
}
