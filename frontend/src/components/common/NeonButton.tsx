/**
 * CTA button — neon glow, cinematic
 */
import type { ReactNode } from 'react';
import { Link, type To } from 'react-router-dom';
import { clsx } from 'clsx';

interface NeonButtonProps {
  children: ReactNode;
  to?: To;
  state?: unknown;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  className?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition disabled:opacity-50';
const styles = {
  primary: 'bg-cinema-neon-blue text-cinema-bg hover:opacity-90',
  ghost:
    'bg-cinema-glass border border-cinema-glass-border text-cinema-text hover:bg-cinema-glass-border',
};

export function NeonButton({
  children,
  to,
  state,
  onClick,
  type = 'button',
  disabled,
  variant = 'primary',
  className,
}: NeonButtonProps) {
  const cn = clsx(base, styles[variant], className);
  const style =
    variant === 'primary' ? { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' } : undefined;

  if (to) {
    return (
      <Link to={to} state={state} className={cn} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn} style={style}>
      {children}
    </button>
  );
}
