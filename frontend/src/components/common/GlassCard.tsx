/**
 * Glassmorphism 2.0 card — blur backdrop, border glow
 */
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** 기본 true — false면 padding 없음 (수평 스크롤 등 레이아웃용) */
  padding?: boolean;
}

export function GlassCard({ children, className, padding = true }: GlassCardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-cinema-glass-border backdrop-blur-xl',
        'bg-cinema-glass shadow-[0_0_24px_rgba(0,0,0,0.2)]',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
