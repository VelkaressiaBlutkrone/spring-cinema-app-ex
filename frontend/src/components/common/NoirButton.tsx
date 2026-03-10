/**
 * CTA button — Noir Luxe design system
 * Sharp edges, uppercase tracking, amber accent
 */
import type { ReactNode } from 'react';
import { Link, type To } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { buttonHover, buttonTap } from '@/lib/animations';

interface NoirButtonProps {
  children: ReactNode;
  to?: To;
  state?: unknown;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle';
  className?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-[11px] font-semibold font-sans uppercase tracking-[3px] transition-all duration-200 ease-out disabled:opacity-50 motion-reduce:transition-none';

const styles = {
  primary:
    'bg-amber text-noir-bg hover:bg-amber-hover hover:shadow-[0_0_24px_rgba(232,168,73,0.3)]',
  ghost:
    'bg-transparent text-amber border border-amber/30 hover:border-amber/60 hover:shadow-[0_0_16px_rgba(232,168,73,0.1)]',
  danger:
    'bg-transparent text-noir-danger border border-noir-danger/30 hover:border-noir-danger/60 hover:shadow-[0_0_16px_rgba(196,64,64,0.1)]',
  subtle:
    'bg-noir-text/[0.04] text-noir-text-secondary border-none hover:bg-noir-text/[0.08] hover:text-noir-text-secondary/70',
};

export function NoirButton({
  children,
  to,
  state,
  onClick,
  type = 'button',
  disabled,
  variant = 'primary',
  className,
}: NoirButtonProps) {
  const cn = clsx(base, styles[variant], className);

  if (to) {
    return (
      <motion.div whileHover={buttonHover} whileTap={buttonTap} className="inline-flex">
        <Link to={to} state={state} className={cn}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn}
      whileHover={disabled ? undefined : buttonHover}
      whileTap={disabled ? undefined : buttonTap}
    >
      {children}
    </motion.button>
  );
}
