/**
 * Card — Noir Luxe design system
 * Near-sharp edges, grain overlay, amber glow on hover
 */
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface NoirCardProps {
  children: ReactNode;
  className?: string;
  /** true by default — false removes padding (for layout containers like horizontal scroll) */
  padding?: boolean;
}

export function NoirCard({ children, className, padding = true }: NoirCardProps) {
  return (
    <div
      className={clsx(
        'rounded-sm border border-noir-border bg-noir-surface',
        'grain-overlay',
        'transition-all duration-300 ease-out',
        'hover:border-noir-border-hover hover:shadow-[0_4px_32px_rgba(232,168,73,0.06)]',
        'motion-reduce:transition-none',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
