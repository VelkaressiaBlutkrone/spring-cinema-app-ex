/**
 * 모달 — cinema theme (dark glass)
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-cinema-glass-border bg-cinema-surface shadow-2xl ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-cinema-glass-border p-5 sm:p-6">
            <h2 className="font-display text-xl tracking-widest text-cinema-text">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-2xl leading-none text-cinema-muted transition hover:bg-cinema-glass hover:text-cinema-text"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-5 text-cinema-text sm:p-6">{children}</div>
      </div>
    </div>
  );
};
