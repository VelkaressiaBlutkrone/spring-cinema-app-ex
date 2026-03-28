/**
 * 토스트 메시지 — Noir Luxe design system
 * Left color accent bar, type icon, title+message, close button
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

const iconBgStyles: Record<ToastType, string> = {
  success: 'bg-noir-success/15 text-noir-success',
  error: 'bg-noir-danger/15 text-noir-danger',
  info: 'bg-noir-info/15 text-noir-info',
  warning: 'bg-noir-warning/15 text-noir-warning',
};

const textStyles: Record<ToastType, string> = {
  success: 'text-noir-success',
  error: 'text-noir-danger',
  info: 'text-noir-info',
  warning: 'text-noir-warning',
};

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '!',
  info: 'i',
  warning: '⚠',
};

const titles: Record<ToastType, string> = {
  success: '성공',
  error: '오류',
  info: '알림',
  warning: '경고',
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
        'fixed right-4 top-20 z-50 min-w-[300px] max-w-md overflow-hidden rounded-sm',
        'border bg-noir-surface',
        borderStyles[type],
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'flex transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      {/* Left color accent bar */}
      <div className={clsx('w-[3px] shrink-0', barStyles[type])} />

      <div className="flex flex-1 items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <span
          className={clsx(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
            iconBgStyles[type]
          )}
        >
          {icons[type]}
        </span>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className={clsx('text-xs font-semibold', textStyles[type])}>{titles[type]}</p>
          <p className="text-[12px] leading-snug text-noir-text-secondary">{message}</p>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="shrink-0 border-l border-noir-border px-3.5 text-xl leading-none text-noir-text-muted transition-colors hover:text-noir-text"
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
};
