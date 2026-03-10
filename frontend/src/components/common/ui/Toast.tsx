/**
 * 토스트 메시지 — Noir Luxe design system
 * Dark surface, left color bar, semantic border
 */
import { useEffect } from 'react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const borderStyles: Record<ToastType, string> = {
  success: 'border-noir-success/30',
  error: 'border-noir-danger/30',
  info: 'border-noir-info/30',
  warning: 'border-noir-warning/30',
};

const barStyles: Record<ToastType, string> = {
  success: 'bg-noir-success',
  error: 'bg-noir-danger',
  info: 'bg-noir-info',
  warning: 'bg-noir-warning',
};

const textStyles: Record<ToastType, string> = {
  success: 'text-noir-success',
  error: 'text-noir-danger',
  info: 'text-noir-info',
  warning: 'text-noir-warning',
};

export const Toast = ({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={clsx(
        'fixed top-20 right-4 z-50 min-w-[300px] max-w-md overflow-hidden rounded-sm',
        'bg-noir-surface border',
        borderStyles[type],
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        'flex'
      )}
      role="alert"
    >
      {/* Left color bar */}
      <div className={clsx('w-[3px] shrink-0', barStyles[type])} />
      <div className="flex flex-1 items-center gap-3 px-5 py-4">
        <p className={clsx('flex-1 text-[13px] font-sans font-normal', textStyles[type])}>{message}</p>
        <button
          onClick={onClose}
          className="shrink-0 text-noir-text-muted hover:text-noir-text transition-colors text-xl leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
};
