/**
 * Glassmorphism 2.0 card — blur backdrop, border glow
 */
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
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
